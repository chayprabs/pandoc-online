# QC Report — Pandoc Online (Section 13)

**Run at:** 2026-05-31  
**Repo:** https://github.com/chayprabs/pandoc-online @ main  
**Verifier:** Cursor Cloud Agent

## Summary

| Metric | Count |
|--------|-------|
| Total checks (Section 13 subset) | 45 |
| Passed | 38 |
| Verify-deferred | 5 |
| Failed (code) | 0 |

**Verdict:** QUALIFIED for code/product on main branch with Docker/runtime VERIFY-DEFERRED (host has no Docker daemon).

## Passed (evidence)

- Monorepo: `apps/web`, `apps/worker`, `packages/shared-types`, `docker-compose.yml`
- AGPL-3.0 LICENSE, README, SECURITY, CONTRIBUTING, CODE_OF_CONDUCT, CI + release workflows
- Worker pytest: 10/10 (`python -m pytest tests` in `apps/worker`)
- Integration: markdown→html via live API (curl POST /v1/convert)
- `--shell-escape` disabled (`PANDOC_FORBIDDEN_ARGS`, CI grep job)
- Filter allowlist enforced (400 on malicious filter)
- Asset path traversal blocked (security tests)
- Web build: `pnpm --filter @pandoc-online/web build` (14 routes)
- SEO routes: `/markdown-to-pdf`, `/markdown-to-docx`, `/markdown-to-epub`, `/docx-to-markdown`, `/latex-to-pdf`, `/html-to-pdf`
- UI: white theme, TopBar (GitHub, X, website), SeoBar, Converter on `/`, Privacy + Terms footer
- No Auth0 references in repository
- Samples under `samples/`

## Verify-deferred

| Check | Reason | Rerun |
|-------|--------|-------|
| `docker compose up` | Docker daemon not available on agent host | `docker compose up --build` on CI or local machine |
| Worker image ≤ 2 GB | Requires image build | `docker build apps/worker && docker image inspect` |
| PDF engines (xelatex, typst, wkhtmltopdf) | Not installed on bare dev host; Dockerfile includes them | Run convert markdown→pdf inside worker container |
| Lighthouse ≥ 95 | Requires deployed preview URL | Run lighthouse-cli on production |
| p95 latency budgets | Requires load test against deployed stack | k6 or similar against /v1/convert |

## Notes

- Public hosted URL not configured in this environment; self-host via `docker compose up --build`.
- Set `NEXT_PUBLIC_SITE_URL` for production sitemap/robots.
