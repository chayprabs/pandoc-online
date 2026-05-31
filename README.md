# Pandoc Online

Convert **Markdown**, **DOCX**, **HTML**, **LaTeX**, **EPUB** and **PDF** online via [Pandoc](https://pandoc.org/) with templates, citations (CSL/BibTeX), allowlisted filters, and math support (KaTeX/MathJax/MathML).

Free document conversion playground — paste or upload your source, pick input/output formats, then download the result. No login required.

![Pandoc Online converter UI](docs/screenshots/converter-ui.svg)

## Features

- **Monaco editor** — syntax-highlighted source editing with format auto-detect
- **15+ formats** — Markdown, GFM, HTML, DOCX, ODT, LaTeX, EPUB, RST, Org, AsciiDoc, and more
- **Inspect panel** — headings, title, and asset references before you convert
- **Template gallery** — built-in HTML and LaTeX templates plus custom upload
- **PDF engines** — xelatex (default), lualatex, pdflatex, wkhtmltopdf, Typst
- **Citations** — BibTeX + CSL styles (APA, Chicago, IEEE, Nature, Vancouver)
- **Filters** — Curated Lua filter allowlist (no arbitrary code)
- **Security** — `--shell-escape` disabled; ephemeral job storage with TTL
- **CLI snippet** — Copy the equivalent `pandoc` command after each conversion

## Quick start (self-host)

```bash
git clone https://github.com/chayprabs/pandoc-online.git
cd pandoc-online
docker compose up --build
```

Open [http://localhost:3000](http://localhost:3000). API worker: [http://localhost:8080/health](http://localhost:8080/health).

### Development without Docker

```bash
pnpm install
pnpm --filter @pandoc-online/shared-types build

# Terminal 1 — worker (requires pandoc on PATH)
cd apps/worker && pip install -r requirements.txt
uvicorn app.main:app --reload --port 8080

# Terminal 2 — web
pnpm --filter @pandoc-online/web dev
```

## API

- `POST /v1/convert` — convert document
- `POST /v1/inspect` — extract headings and assets
- `GET /v1/formats` — format matrix
- `GET /v1/templates` — template gallery
- `GET /v1/csl-styles` — CSL gallery

## SEO landing pages

- `/markdown-to-pdf`
- `/markdown-to-docx`
- `/markdown-to-epub`
- `/docx-to-markdown`
- `/latex-to-pdf`
- `/html-to-pdf`

## License

AGPL-3.0 — see [LICENSE](LICENSE).

## Security

See [SECURITY.md](SECURITY.md). Report issues via GitHub Security Advisories.

## Topics

`pandoc` `markdown` `docx` `latex` `epub` `html-to-pdf` `markdown-to-pdf` `markdown-to-docx` `docx-to-markdown` `citations` `bibtex` `csl` `document-conversion` `online-tool` `pandoc-online`
