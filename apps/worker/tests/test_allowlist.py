from app.config import ALLOWED_FILTERS, PANDOC_FORBIDDEN_ARGS
from app.pandoc_runner import validate_filters, shell_escape_disabled


def test_shell_escape_forbidden():
    assert "--shell-escape" in PANDOC_FORBIDDEN_ARGS


def test_filter_allowlist_rejects_unknown():
    import pytest
    from fastapi import HTTPException

    with pytest.raises(HTTPException) as exc:
        validate_filters(["evil-filter"])
    assert "not allowlisted" in exc.value.detail


def test_filter_allowlist_accepts_known():
    assert validate_filters(["pagebreak"]) == ["pagebreak"]
    assert "pagebreak" in ALLOWED_FILTERS
