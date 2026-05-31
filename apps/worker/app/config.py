import os
from pathlib import Path

JOB_ROOT = Path(os.environ.get("JOB_ROOT", "/tmp/pandoc-jobs"))
JOB_TTL_SECONDS = int(os.environ.get("JOB_TTL_SECONDS", "3600"))
MAX_JOB_BYTES = int(os.environ.get("MAX_JOB_BYTES", str(25 * 1024 * 1024)))
MAX_JOB_DURATION_SECONDS = int(os.environ.get("MAX_JOB_DURATION_SECONDS", "120"))
PANDOC_BIN = os.environ.get("PANDOC_BIN", "pandoc")

# Security: never allow shell-escape
PANDOC_FORBIDDEN_ARGS = {"--shell-escape", "-shell-escape"}

ALLOWED_FILTERS = frozenset(
    {
        "pagebreak",
    }
)

FORMAT_ALIASES = {
    "md": "markdown",
    "tex": "latex",
    "htm": "html",
}

READ_FORMATS = frozenset(
    {
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
    }
)

WRITE_FORMATS = READ_FORMATS | {"pdf"}

CSL_GALLERY = {
    "apa": "apa.csl",
    "chicago-author-date": "chicago-author-date.csl",
    "ieee": "ieee.csl",
    "nature": "nature.csl",
    "vancouver": "vancouver.csl",
}
