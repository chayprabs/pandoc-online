import pytest
from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)

MATRIX = [
    ("markdown", "html"),
    ("markdown", "latex"),
    ("markdown", "rst"),
    ("markdown", "org"),
    ("html", "markdown"),
    ("rst", "html"),
    ("org", "html"),
    ("latex", "html"),
]

OPTIONAL_MATRIX = [
    ("markdown", "docx"),
    ("markdown", "epub"),
]


@pytest.fixture
def pandoc_available():
    import shutil

    if not shutil.which("pandoc"):
        pytest.skip("pandoc not installed")


def _convert(src: str, tgt: str, content: str = "# Test\n\nParagraph."):
    return client.post(
        "/v1/convert",
        json={"source": {"format": src, "content": content}, "target": {"format": tgt}},
    )


@pytest.mark.parametrize("src,tgt", MATRIX)
def test_format_pair(pandoc_available, src: str, tgt: str):
    response = _convert(src, tgt)
    assert response.status_code == 200, response.text
    data = response.json()
    assert "jobId" in data or "job_id" in data


@pytest.mark.parametrize("src,tgt", OPTIONAL_MATRIX)
def test_format_pair_optional(pandoc_available, src: str, tgt: str):
    response = _convert(src, tgt)
    if response.status_code == 424:
        pytest.skip("Pandoc data files not installed for this output format")
    assert response.status_code == 200, response.text


def test_unsupported_same_format_pair(pandoc_available):
    response = client.post(
        "/v1/convert",
        json={
            "source": {"format": "json", "content": "{}"},
            "target": {"format": "json"},
        },
    )
    assert response.status_code == 400
    assert "FORMAT_UNSUPPORTED_PAIR" in response.json()["detail"]
