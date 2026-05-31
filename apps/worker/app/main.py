import os
import shutil
import time
from contextlib import asynccontextmanager
from pathlib import Path

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, JSONResponse

from .config import JOB_ROOT, JOB_TTL_SECONDS, MAX_JOB_BYTES, READ_FORMATS, WRITE_FORMATS
from .models import ConvertJob, ConvertResult, InspectJob, InspectResult
from .pandoc_runner import inspect_source, normalize_format, run_pandoc

def _cors_origins() -> list[str]:
    raw = os.environ.get("CORS_ORIGINS", "http://localhost:3000")
    return [o.strip() for o in raw.split(",") if o.strip()]


@asynccontextmanager
async def lifespan(_app: FastAPI):
    JOB_ROOT.mkdir(parents=True, exist_ok=True)
    _cleanup_stale_jobs()
    yield
    _cleanup_stale_jobs()


app = FastAPI(title="PandocAaS Worker", version="1.0.0", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=_cors_origins(),
    allow_methods=["*"],
    allow_headers=["*"],
)


def _cleanup_stale_jobs() -> None:
    if not JOB_ROOT.exists():
        return
    cutoff = time.time() - JOB_TTL_SECONDS
    for child in JOB_ROOT.iterdir():
        if child.is_dir() and child.stat().st_mtime < cutoff:
            shutil.rmtree(child, ignore_errors=True)


@app.get("/health")
def health() -> dict:
    import subprocess

    from .config import PANDOC_BIN

    version = "unknown"
    try:
        proc = subprocess.run(
            [PANDOC_BIN, "--version"],
            capture_output=True,
            text=True,
            timeout=10,
            check=False,
        )
        if proc.stdout:
            version = proc.stdout.splitlines()[0]
    except (FileNotFoundError, subprocess.TimeoutExpired):
        version = "not installed"
    tex_cache = Path("/root/.cache/texlive")
    tex_warmed = tex_cache.exists() and any(tex_cache.rglob("*"))
    degraded = version == "not installed"
    return {
        "status": "degraded" if degraded else "ok",
        "pandoc": version,
        "tex_cache_warmed": tex_warmed,
        "shell_escape": "disabled",
    }


@app.get("/v1/formats")
def formats() -> dict:
    matrix = []
    for read_fmt in sorted(READ_FORMATS):
        matrix.append({"read": read_fmt, "write": sorted(WRITE_FORMATS)})
    return {"formats": matrix}


@app.get("/v1/templates")
def templates() -> dict:
    gallery_dir = Path(__file__).parent / "data" / "templates"
    items = []
    if gallery_dir.exists():
        for path in sorted(gallery_dir.glob("*")):
            if path.is_file():
                items.append({"id": path.stem, "name": path.stem.replace("-", " ").title()})
    return {"templates": items or [{"id": "default", "name": "Default"}]}


@app.get("/v1/csl-styles")
def csl_styles() -> dict:
    from .config import CSL_GALLERY

    return {
        "styles": [
            {"id": key, "name": key.replace("-", " ").title()}
            for key in sorted(CSL_GALLERY.keys())
        ]
    }


@app.post("/v1/convert", response_model=ConvertResult)
def convert(job: ConvertJob) -> ConvertResult:
    _cleanup_stale_jobs()
    if len(job.source.content.encode("utf-8")) > MAX_JOB_BYTES * 2:
        raise HTTPException(status_code=400, detail="Source content exceeds size limit")
    work_dir, output_path, command, warnings = run_pandoc(job)
    job_id = work_dir.name
    artifact_name = output_path.name
    return ConvertResult(
        artifactUrl=f"/v1/jobs/{job_id}/artifact",
        logUrl=f"/v1/jobs/{job_id}/log",
        command=command,
        artifactName=artifact_name,
        warnings=warnings,
    )


@app.post("/v1/inspect", response_model=InspectResult)
def inspect(job: InspectJob) -> InspectResult:
    data = inspect_source(job.source.content, job.source.format)
    return InspectResult(**data)


@app.get("/v1/jobs/{job_id}/artifact")
def download_artifact(job_id: str) -> FileResponse:
    work_dir = JOB_ROOT / job_id
    if not work_dir.exists():
        raise HTTPException(status_code=404, detail="Job not found")
    outputs = list(work_dir.glob("output.*"))
    if not outputs:
        raise HTTPException(status_code=404, detail="Artifact not found")
    path = outputs[0]
    media = _media_type_for(path)
    return FileResponse(path, filename=path.name, media_type=media)


@app.get("/v1/jobs/{job_id}/log")
def download_log(job_id: str) -> FileResponse:
    log_path = JOB_ROOT / job_id / "conversion.log"
    if not log_path.exists():
        raise HTTPException(status_code=404, detail="Log not found")
    return FileResponse(log_path, filename="conversion.log", media_type="text/plain")


@app.get("/v1/jobs/{job_id}/assets.zip")
def download_assets_zip(job_id: str) -> FileResponse:
    import zipfile

    work_dir = JOB_ROOT / job_id
    if not work_dir.exists():
        raise HTTPException(status_code=404, detail="Job not found")
    zip_path = work_dir / "assets.zip"
    with zipfile.ZipFile(zip_path, "w") as zf:
        for asset in work_dir.iterdir():
            if asset.name.startswith("output.") or asset.name in {
                "input.md",
                "conversion.log",
                "assets.zip",
            }:
                continue
            if asset.is_file():
                zf.write(asset, arcname=asset.name)
    return FileResponse(zip_path, filename="assets.zip", media_type="application/zip")


def _media_type_for(path: Path) -> str:
    ext = path.suffix.lower()
    return {
        ".html": "text/html",
        ".pdf": "application/pdf",
        ".docx": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        ".epub": "application/epub+zip",
        ".md": "text/markdown",
        ".json": "application/json",
    }.get(ext, "application/octet-stream")


@app.exception_handler(HTTPException)
def http_exception_handler(_request, exc: HTTPException):
    return JSONResponse(status_code=exc.status_code, content={"detail": exc.detail})
