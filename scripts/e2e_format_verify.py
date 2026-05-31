#!/usr/bin/env python3
"""E2E verification: every READ_FORMAT -> html + PRD 13.4 SEO pairs."""

from __future__ import annotations

import base64
import json
import sys
import urllib.error
import urllib.request
from pathlib import Path

BASE = "http://localhost:8080"
FIXTURES = Path("/tmp/pandoc-e2e-fixtures")

# PRD Section 13.4 / SEO landing page conversion pairs
PRD_13_4_PAIRS = [
    ("markdown", "pdf", "# Hello\n\nWorld.", None),
    ("markdown", "docx", "# Hello\n\nWorld.", None),
    ("markdown", "epub", "# Hello\n\nWorld.", None),
    ("docx", "markdown", None, FIXTURES / "sample.docx"),
    ("latex", "pdf", r"\documentclass{article}\begin{document}Hi\end{document}", None),
    ("html", "pdf", "<h1>Hi</h1><p>Test</p>", None),
]

TEXT_SAMPLES: dict[str, str] = {
    "markdown": "# Title\n\nParagraph with **bold**.",
    "gfm": "# Title\n\n| A | B |\n|---|---|\n| 1 | 2 |",
    "commonmark": "# Title\n\nPlain commonmark.",
    "html": "<!DOCTYPE html><html><body><h1>Hi</h1></body></html>",
    "latex": r"\documentclass{article}\begin{document}Hello\end{document}",
    "rst": "Title\n=====\n\nBody text.",
    "org": "* Title\n\nBody.",
    "mediawiki": "== Title ==\n\nBody.",
    "textile": "h1. Title\n\nBody.",
    "json": json.dumps(
        {
            "pandoc-api-version": [1, 23, 1],
            "meta": {},
            "blocks": [
                {
                    "t": "Header",
                    "c": [1, ["title", [], []], [{"t": "Str", "c": "Title"}]],
                },
                {
                    "t": "Para",
                    "c": [{"t": "Str", "c": "Body."}],
                },
            ],
        }
    ),
}

BINARY_FIXTURES: dict[str, Path] = {
    "docx": FIXTURES / "sample.docx",
    "odt": FIXTURES / "sample.odt",
    "epub": FIXTURES / "sample.epub",
}

READ_FORMATS = [
    "markdown",
    "gfm",
    "commonmark",
    "html",
    "docx",
    "odt",
    "latex",
    "epub",
    "rst",
    "org",
    "mediawiki",
    "textile",
    "json",
]


def http_json(method: str, url: str, body: dict | None = None) -> tuple[int, dict | str]:
    data = None
    headers = {"Content-Type": "application/json"}
    if body is not None:
        data = json.dumps(body).encode()
    req = urllib.request.Request(url, data=data, headers=headers, method=method)
    try:
        with urllib.request.urlopen(req, timeout=130) as resp:
            raw = resp.read().decode()
            try:
                return resp.status, json.loads(raw)
            except json.JSONDecodeError:
                return resp.status, raw
    except urllib.error.HTTPError as e:
        raw = e.read().decode()
        try:
            return e.code, json.loads(raw)
        except json.JSONDecodeError:
            return e.code, raw


def download_artifact(url: str) -> tuple[int, bytes]:
    req = urllib.request.Request(BASE + url if url.startswith("/") else url)
    try:
        with urllib.request.urlopen(req, timeout=30) as resp:
            return resp.status, resp.read()
    except urllib.error.HTTPError as e:
        return e.code, e.read()


def build_source(fmt: str, text: str | None, path: Path | None) -> dict:
    if path is not None:
        b64 = base64.b64encode(path.read_bytes()).decode()
        return {"format": fmt, "content": b64}
    assert text is not None
    return {"format": fmt, "content": text}


def run_convert(
    src_fmt: str,
    tgt_fmt: str,
    text: str | None = None,
    path: Path | None = None,
    options: dict | None = None,
) -> dict:
    payload: dict = {
        "source": build_source(src_fmt, text, path),
        "target": {"format": tgt_fmt},
    }
    if options:
        payload["options"] = options
    status, data = http_json("POST", f"{BASE}/v1/convert", payload)
    row = {
        "input": src_fmt,
        "output": tgt_fmt,
        "status": "PASS" if status == 200 else "FAIL",
        "http": status,
        "error": "",
        "artifact_bytes": 0,
    }
    if status != 200:
        detail = data.get("detail", data) if isinstance(data, dict) else data
        row["error"] = str(detail)[:500]
        return row
    artifact_url = data.get("artifactUrl", "")
    dl_status, content = download_artifact(artifact_url)
    if dl_status != 200:
        row["status"] = "FAIL"
        row["error"] = f"artifact download HTTP {dl_status}"
        return row
    row["artifact_bytes"] = len(content)
    if len(content) == 0:
        row["status"] = "FAIL"
        row["error"] = "artifact empty"
        return row
    if tgt_fmt == "html" and b"<" not in content[:2000]:
        row["status"] = "FAIL"
        row["error"] = "html output missing markup"
    return row


def main() -> int:
    results: list[dict] = []
    bugs: list[str] = []

    print("=== READ_FORMATS -> html ===")
    for fmt in READ_FORMATS:
        text = TEXT_SAMPLES.get(fmt)
        path = BINARY_FIXTURES.get(fmt)
        row = run_convert(fmt, "html", text=text, path=path)
        results.append(row)
        mark = "✓" if row["status"] == "PASS" else "✗"
        err = f" — {row['error']}" if row["error"] else ""
        print(f"  {mark} {fmt} -> html ({row['artifact_bytes']} bytes){err}")
        if row["status"] == "FAIL":
            bugs.append(f"{fmt}->html: {row['error']}")

    print("\n=== PRD Section 13.4 SEO pairs ===")
    for src, tgt, text, path in PRD_13_4_PAIRS:
        opts = None
        if tgt == "pdf":
            # Try wkhtmltopdf first (no TeX in CI); fallback default
            opts = {"pdfEngine": "wkhtmltopdf"}
        row = run_convert(src, tgt, text=text, path=path, options=opts)
        if row["status"] == "FAIL" and tgt == "pdf" and opts:
            row2 = run_convert(src, tgt, text=text, path=path, options={"pdfEngine": "typst"})
            if row2["status"] == "PASS":
                row = row2
            else:
                row3 = run_convert(src, tgt, text=text, path=path)
                if row3["status"] == "PASS":
                    row = row3
        row["prd_13_4"] = True
        results.append(row)
        mark = "✓" if row["status"] == "PASS" else "✗"
        err = f" — {row['error']}" if row["error"] else ""
        print(f"  {mark} {src} -> {tgt}{err}")
        if row["status"] == "FAIL":
            bugs.append(f"PRD 13.4 {src}->{tgt}: {row['error']}")

    print("\n=== MATRIX TABLE ===")
    print("| Input | Output | Status | Error |")
    print("|-------|--------|--------|-------|")
    for r in results:
        err = (r["error"] or "").replace("|", "\\|").replace("\n", " ")[:80]
        print(f"| {r['input']} | {r['output']} | {r['status']} | {err} |")

    print("\n=== BUG LIST ===")
    if not bugs:
        print("(none)")
    else:
        for b in bugs:
            print(f"- {b}")

    out_path = Path("/tmp/pandoc-e2e-results.json")
    out_path.write_text(json.dumps(results, indent=2))
    print(f"\nWrote {out_path}")

    fails = sum(1 for r in results if r["status"] == "FAIL")
    return 1 if fails else 0


if __name__ == "__main__":
    sys.exit(main())
