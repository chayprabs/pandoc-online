# QC Report — Pandoc Online (Section 13)

**Run at:** 2026-05-31 (updated)  
**Repo:** https://github.com/chayprabs/pandoc-online @ main  
**Verdict:** **QUALIFIED** (code/product) — Docker image size / Lighthouse / p95 on deploy host may still be verified separately.

## Implemented since initial build

| Area | Status |
|------|--------|
| Monaco editor | Done — `SourceEditor.tsx` |
| Template gallery files | Done — `apps/worker/app/data/templates/` |
| Inspect UI | Done — live inspect tab + API |
| Full format matrix from API | Done — `fetchFormats()` drives selectors |
| Preview pane | Done — HTML iframe in ResultTabs |
| Sample picker | Done — `SamplePicker` + `samples.ts` |
| Playwright e2e | Done — `apps/web/e2e/` + CI job |
| shared-ui package | Done — `packages/shared-ui/` |
| GHCR release push | Done — `release.yml` |
| README screenshot | Done — `docs/screenshots/converter-ui.svg` |
| Format matrix tests | Done — `test_format_matrix.py` |
| CodeQL workflow | Done — `.github/workflows/codeql.yml` |
| Security hardening | Path traversal, base64 validation, CORS env |
| SEO nav links | Done — `SeoNav.tsx` |

## Test evidence

- Worker: `python -m pytest tests` — 19+ passed (docx/epub skip if no pandoc-data)
- Web: `pnpm build`, `pnpm typecheck`, vitest, Playwright e2e in CI
- CI: web, worker, docker, shell-escape-check jobs

## Verify on deploy

- `docker compose up --build`
- Lighthouse ≥ 95 on production URL
- p95 Markdown→PDF / EPUB latency
- Set `NEXT_PUBLIC_SITE_URL` for sitemap
