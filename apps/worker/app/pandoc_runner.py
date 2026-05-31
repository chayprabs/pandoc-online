import base64
import binascii
import os
import re
import shutil
import subprocess
import uuid
from pathlib import Path

from fastapi import HTTPException

from .config import (
    ALLOWED_FILTERS,
    CSL_GALLERY,
    FORMAT_ALIASES,
    JOB_ROOT,
    MAX_JOB_BYTES,
    MAX_JOB_DURATION_SECONDS,
    PANDOC_BIN,
    PANDOC_FORBIDDEN_ARGS,
    READ_FORMATS,
    WRITE_FORMATS,
)
from .models import ConvertJob, ConvertOptions

OUTPUT_EXT = {
    "markdown": ".md",
    "gfm": ".md",
    "commonmark": ".md",
    "html": ".html",
    "docx": ".docx",
    "odt": ".odt",
    "latex": ".tex",
    "epub": ".epub",
    "rst": ".rst",
    "org": ".org",
    "asciidoc": ".adoc",
    "mediawiki": ".wiki",
    "textile": ".textile",
    "json": ".json",
    "pdf": ".pdf",
}


def normalize_format(fmt: str) -> str:
    key = fmt.strip().lower()
    return FORMAT_ALIASES.get(key, key)


def validate_formats(source_fmt: str, target_fmt: str) -> None:
    src = normalize_format(source_fmt)
    tgt = normalize_format(target_fmt)
    if src not in READ_FORMATS:
        raise HTTPException(status_code=400, detail=f"Unsupported source format: {source_fmt}")
    if tgt not in WRITE_FORMATS:
        raise HTTPException(status_code=400, detail=f"Unsupported target format: {target_fmt}")


def validate_filters(filters: list[str] | None) -> list[str]:
    if not filters:
        return []
    invalid = [f for f in filters if f not in ALLOWED_FILTERS]
    if invalid:
        raise HTTPException(
            status_code=400,
            detail=f"Filter(s) not allowlisted: {', '.join(invalid)}",
        )
    return filters


def build_math_args(math: str | None, target_fmt: str) -> list[str]:
    if not math or normalize_format(target_fmt) != "html":
        return []
    if math == "katex":
        return ["--katex"]
    if math == "mathjax":
        return ["--mathjax"]
    if math == "mathml":
        return ["--mathml"]
    return []


def build_pdf_engine_args(
    options: ConvertOptions | None,
    target_fmt: str,
    target_engine: str | None = None,
) -> list[str]:
    if normalize_format(target_fmt) != "pdf":
        return []
    engine = (options.pdf_engine if options else None) or target_engine or "xelatex"
    if engine == "wkhtmltopdf":
        return ["--pdf-engine=wkhtmltopdf"]
    if engine == "typst":
        return ["--pdf-engine=typst"]
    return [f"--pdf-engine={engine}"]


def build_citation_args(options: ConvertOptions | None, work_dir: Path) -> list[str]:
    if not options or not options.citations:
        return []
    if len(options.citations.bib.encode("utf-8")) > MAX_JOB_BYTES:
        raise HTTPException(status_code=400, detail="Bibliography exceeds size limit")
    bib_path = work_dir / "references.bib"
    bib_path.write_text(options.citations.bib, encoding="utf-8")
    csl_key = options.citations.csl_style.lower()
    csl_file = CSL_GALLERY.get(csl_key, f"{csl_key}.csl")
    bundled = Path(__file__).parent / "data" / "csl" / csl_file
    if bundled.exists():
        csl_path = work_dir / "style.csl"
        shutil.copy(bundled, csl_path)
    else:
        csl_path = work_dir / "style.csl"
        csl_path.write_text(_default_csl(), encoding="utf-8")
    return [
        f"--bibliography={bib_path}",
        f"--csl={csl_path}",
        "--citeproc",
    ]


def _default_csl() -> str:
    return """<?xml version="1.0" encoding="utf-8"?>
<style xmlns="http://purl.org/net/xbiblio/csl" class="in-text" version="1.0">
  <info><title>Fallback APA</title></info>
  <citation><layout suffix=")" prefix="(" delimiter="; "><text variable="author"/><text variable="year"/></layout></citation>
  <bibliography><layout><text variable="citation-number" suffix=". "/><text variable="title"/></layout></bibliography>
</style>"""


def build_command(job: ConvertJob, work_dir: Path) -> tuple[list[str], Path]:
    options = job.options or ConvertOptions()
    src_fmt = normalize_format(job.source.format)
    tgt_fmt = normalize_format(job.target.format)
    validate_formats(src_fmt, tgt_fmt)
    filters = validate_filters(options.filters)

    input_path = work_dir / f"input{OUTPUT_EXT.get(src_fmt, '.txt')}"
    output_path = work_dir / f"output{OUTPUT_EXT.get(tgt_fmt, '.out')}"

    source_bytes = _decode_source_content(job.source.content, src_fmt)
    if len(source_bytes) > MAX_JOB_BYTES:
        raise HTTPException(status_code=400, detail="Source content exceeds size limit")
    if _is_binary_format(src_fmt):
        input_path.write_bytes(source_bytes)
    else:
        input_path.write_bytes(source_bytes)

    if job.assets:
        for asset in job.assets:
            raw = _decode_base64(asset.content_base64, "asset")
            if len(raw) > MAX_JOB_BYTES:
                raise HTTPException(status_code=400, detail=f"Asset too large: {asset.name}")
            dest = _safe_asset_path(work_dir, asset.name)
            dest.write_bytes(raw)

    cmd: list[str] = [
        PANDOC_BIN,
        str(input_path),
        "-f",
        src_fmt,
        "-t",
        tgt_fmt,
        "-o",
        str(output_path),
        "--sandbox",
    ]

    for forbidden in PANDOC_FORBIDDEN_ARGS:
        if forbidden in cmd:
            raise HTTPException(status_code=400, detail="Forbidden pandoc argument")

    if options.toc:
        cmd.append("--toc")
    if options.number_sections:
        cmd.append("--number-sections")
    if options.template:
        if len(options.template.encode("utf-8")) > MAX_JOB_BYTES:
            raise HTTPException(status_code=400, detail="Template exceeds size limit")
        template_path = work_dir / "template.custom"
        template_path.write_text(options.template, encoding="utf-8")
        cmd.extend(["--template", str(template_path)])
    if options.reference_doc:
        ref_bytes = _decode_base64(options.reference_doc, "referenceDoc")
        if len(ref_bytes) > MAX_JOB_BYTES:
            raise HTTPException(status_code=400, detail="Reference document exceeds size limit")
        ref_path = work_dir / "reference.docx"
        ref_path.write_bytes(ref_bytes)
        cmd.extend(["--reference-doc", str(ref_path)])

    for flt in filters:
        filter_path = Path(__file__).parent / "filters" / f"{flt}.lua"
        if filter_path.exists():
            cmd.extend(["--lua-filter", str(filter_path)])

    cmd.extend(build_math_args(options.math, tgt_fmt))
    cmd.extend(build_pdf_engine_args(options, tgt_fmt, job.target.engine))
    cmd.extend(build_citation_args(options, work_dir))

    return cmd, output_path


def shell_escape_disabled(cmd: list[str]) -> None:
    for arg in cmd:
        if arg in PANDOC_FORBIDDEN_ARGS or "shell-escape" in arg:
            raise HTTPException(status_code=400, detail="shell-escape is disabled")


def run_pandoc(job: ConvertJob) -> tuple[Path, Path, str, list[str]]:
    job_id = str(uuid.uuid4())
    work_dir = JOB_ROOT / job_id
    work_dir.mkdir(parents=True, exist_ok=True)
    log_path = work_dir / "conversion.log"

    cmd, output_path = build_command(job, work_dir)
    shell_escape_disabled(cmd)
    display_cmd = " ".join(_quote(arg) for arg in cmd)

    try:
        result = subprocess.run(
            cmd,
            capture_output=True,
            text=True,
            timeout=MAX_JOB_DURATION_SECONDS,
            cwd=work_dir,
            check=False,
        )
    except subprocess.TimeoutExpired as exc:
        log_path.write_text(str(exc), encoding="utf-8")
        raise HTTPException(status_code=424, detail="424_PANDOC_FAILED: conversion timed out") from exc
    except FileNotFoundError as exc:
        raise HTTPException(status_code=503, detail="Pandoc is not installed on this worker") from exc

    warnings: list[str] = []
    log_lines = [f"Command: {display_cmd}", f"Exit code: {result.returncode}"]
    if result.stdout:
        log_lines.append(f"stdout:\n{result.stdout}")
    if result.stderr:
        log_lines.append(f"stderr:\n{result.stderr}")
        warnings.extend(
            line
            for line in result.stderr.splitlines()
            if "warning" in line.lower() or "Warning" in line
        )
    log_path.write_text("\n".join(log_lines), encoding="utf-8")

    if result.returncode != 0:
        detail = "424_LATEX_FAILED" if "latex" in result.stderr.lower() else "424_PANDOC_FAILED"
        raise HTTPException(
            status_code=424,
            detail=f"{detail}: {result.stderr.strip() or 'conversion failed'}",
        )

    if not output_path.exists():
        raise HTTPException(status_code=424, detail="424_PANDOC_FAILED: no output produced")

    return work_dir, output_path, display_cmd, warnings


BINARY_FORMATS = frozenset({"docx", "odt", "epub", "json"})


def _is_binary_format(fmt: str) -> bool:
    return normalize_format(fmt) in BINARY_FORMATS


def _decode_base64(data: str, field: str) -> bytes:
    try:
        return base64.b64decode(data, validate=True)
    except (binascii.Error, ValueError) as exc:
        raise HTTPException(status_code=400, detail=f"Invalid base64 in {field}") from exc


def _decode_source_content(content: str, fmt: str) -> bytes:
    if content.startswith("base64:"):
        return _decode_base64(content[7:], "source.content")
    if _is_binary_format(fmt):
        try:
            return base64.b64decode(content, validate=True)
        except (binascii.Error, ValueError):
            pass
    return content.encode("utf-8")


def _safe_asset_path(work_dir: Path, name: str) -> Path:
    if ".." in name or name.startswith("/") or os.path.isabs(name):
        raise HTTPException(status_code=400, detail="Invalid asset name")
    safe_name = Path(name).name
    if not safe_name:
        raise HTTPException(status_code=400, detail="Invalid asset name")
    dest = (work_dir / safe_name).resolve()
    if not str(dest).startswith(str(work_dir.resolve()) + os.sep):
        raise HTTPException(status_code=400, detail="Invalid asset name")
    return dest


def _quote(arg: str) -> str:
    if re.search(r"\s|['\"\\]", arg):
        return "'" + arg.replace("'", "'\\''") + "'"
    return arg


def inspect_source(content: str, fmt: str) -> dict:
    src_fmt = normalize_format(fmt)
    validate_formats(src_fmt, "html")
    headings: list[dict] = []
    for line in content.splitlines():
        match = re.match(r"^(#{1,6})\s+(.+)$", line)
        if match:
            headings.append({"level": len(match.group(1)), "text": match.group(2).strip()})
    assets = re.findall(r"!\[[^\]]*\]\(([^)]+)\)", content)
    title_match = re.search(r"^#\s+(.+)$", content, re.MULTILINE)
    return {
        "format": src_fmt,
        "title": title_match.group(1).strip() if title_match else None,
        "headings": headings,
        "assets": assets,
    }
