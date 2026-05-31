import base64
import binascii
import json
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
    if src == tgt and src not in {"html", "markdown", "gfm", "commonmark"}:
        raise HTTPException(
            status_code=400,
            detail="400_FORMAT_UNSUPPORTED_PAIR: source and target formats are identical",
        )


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

    uploaded_assets: list[str] = []
    if job.assets:
        for asset in job.assets:
            raw = _decode_base64(asset.content_base64, "asset")
            if len(raw) > MAX_JOB_BYTES:
                raise HTTPException(status_code=400, detail=f"Asset too large: {asset.name}")
            dest = _safe_asset_path(work_dir, asset.name)
            dest.write_bytes(raw)
            uploaded_assets.append(str(dest.relative_to(work_dir)))
        (work_dir / ".asset_manifest").write_text(json.dumps(uploaded_assets), encoding="utf-8")

    cmd: list[str] = [
        PANDOC_BIN,
        str(input_path),
        "-f",
        src_fmt,
        "-t",
        tgt_fmt,
        "-o",
        str(output_path),
    ]
    if _use_sandbox(src_fmt, tgt_fmt):
        cmd.append("--sandbox")

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
        if options.template.startswith("gallery:"):
            gallery_id = options.template.removeprefix("gallery:")
            bundled = Path(__file__).parent / "data" / "templates"
            found = None
            for ext in ("", ".html", ".tex", ".latex"):
                candidate = bundled / f"{gallery_id}{ext}"
                if candidate.is_file():
                    found = candidate
                    break
            if not found:
                raise HTTPException(status_code=400, detail=f"Unknown gallery template: {gallery_id}")
            shutil.copy(found, template_path)
        else:
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


BINARY_FORMATS = frozenset({"docx", "odt", "epub"})


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
        return _decode_base64(content, "source.content")
    return content.encode("utf-8")


def _use_sandbox(src_fmt: str, tgt_fmt: str) -> bool:
    """Pandoc --sandbox breaks writers that read distro data files (docx, epub, pdf)."""
    needs_data = frozenset({"docx", "epub", "odt", "pdf"})
    return normalize_format(tgt_fmt) not in needs_data and normalize_format(src_fmt) not in {
        "docx",
        "epub",
        "odt",
    }


def _safe_asset_path(work_dir: Path, name: str) -> Path:
    normalized = name.replace("\\", "/").strip()
    if not normalized or normalized.startswith("/") or ".." in normalized.split("/"):
        raise HTTPException(status_code=400, detail="Invalid asset name")
    rel = Path(normalized)
    dest = (work_dir / rel).resolve()
    root = work_dir.resolve()
    if dest != root and not str(dest).startswith(str(root) + os.sep):
        raise HTTPException(status_code=400, detail="Invalid asset name")
    dest.parent.mkdir(parents=True, exist_ok=True)
    return dest


def _quote(arg: str) -> str:
    if re.search(r"\s|['\"\\]", arg):
        return "'" + arg.replace("'", "'\\''") + "'"
    return arg


def inspect_source(content: str, fmt: str) -> dict:
    src_fmt = normalize_format(fmt)
    validate_formats(src_fmt, "html")
    if _is_binary_format(src_fmt):
        return {"format": src_fmt, "title": None, "headings": [], "assets": []}
    headings: list[dict] = []
    title: str | None = None
    assets = re.findall(r"!\[[^\]]*\]\(([^)]+)\)", content)
    assets += re.findall(r'<img[^>]+src=["\']([^"\']+)["\']', content, re.IGNORECASE)
    assets += re.findall(r"\.\.\s+image::\s*(\S+)", content)
    assets += re.findall(r"\\includegraphics(?:\[[^\]]*\])?\{([^}]+)\}", content)

    try:
        proc = subprocess.run(
            [PANDOC_BIN, "-f", src_fmt, "-t", "json", "--quiet"],
            input=content,
            capture_output=True,
            text=True,
            timeout=30,
            check=False,
        )
        if proc.returncode == 0 and proc.stdout:
            doc = json.loads(proc.stdout)
            for block in doc.get("blocks", []):
                if block.get("t") == "Header":
                    level, _, inlines = block["c"]
                    text = _json_inlines_to_text(inlines)
                    headings.append({"level": level, "text": text})
                elif block.get("t") == "Title" and not title:
                    title = _json_inlines_to_text(block["c"])
    except (subprocess.TimeoutExpired, json.JSONDecodeError, KeyError, FileNotFoundError):
        pass

    if not headings:
        for line in content.splitlines():
            match = re.match(r"^(#{1,6})\s+(.+)$", line)
            if match:
                headings.append({"level": len(match.group(1)), "text": match.group(2).strip()})
    if not title:
        rst_title = re.match(r"^(.+)\n=+\s*$", content, re.MULTILINE)
        if rst_title:
            title = rst_title.group(1).strip()

    if not title:
        title_match = re.search(r"^#\s+(.+)$", content, re.MULTILINE)
        if title_match:
            title = title_match.group(1).strip()

    return {
        "format": src_fmt,
        "title": title,
        "headings": headings,
        "assets": assets,
    }


def _json_inlines_to_text(inlines: list) -> str:
    parts: list[str] = []
    for item in inlines:
        if isinstance(item, dict) and "t" in item:
            tag = item["t"]
            val = item.get("c", "")
            if tag == "Str":
                parts.append(str(val))
            elif tag == "Space":
                parts.append(" ")
        elif isinstance(item, list) and len(item) >= 2 and item[0] == "Str":
            parts.append(str(item[1]))
    return "".join(parts).strip()
