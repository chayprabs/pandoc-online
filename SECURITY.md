# Security Policy

## Supported versions

| Version | Supported |
| ------- | --------- |
| 1.x     | Yes       |

## Reporting a vulnerability

Please report security issues via [GitHub Security Advisories](https://github.com/chayprabs/pandoc-online/security/advisories/new) rather than public issues.

## Design notes

- Pandoc is invoked without `--shell-escape`. `--sandbox` is enabled only for text-safe conversions; DOCX/EPUB/PDF writers disable sandbox because Debian pandoc data files are not embedded (see `pandoc_runner._use_sandbox`).
- Only allowlisted Lua filters may be requested.
- Job directories are ephemeral and cleaned on a TTL.
- Source document contents are not written to long-term application logs by design.
