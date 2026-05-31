import pytest
from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)


@pytest.fixture
def pandoc_available():
    import shutil

    if not shutil.which("pandoc"):
        pytest.skip("pandoc not installed")


def test_markdown_to_html(pandoc_available):
    response = client.post(
        "/v1/convert",
        json={
            "source": {"format": "markdown", "content": "# Hello\n\nWorld."},
            "target": {"format": "html"},
        },
    )
    assert response.status_code == 200, response.text
    data = response.json()
    assert "artifactUrl" in data
    assert "jobId" in data or "job_id" in data
    assert "pandoc" in data["command"].lower()


def test_reject_unallowlisted_filter(pandoc_available):
    response = client.post(
        "/v1/convert",
        json={
            "source": {"format": "markdown", "content": "# x"},
            "target": {"format": "html"},
            "options": {"filters": ["malicious-filter"]},
        },
    )
    assert response.status_code == 400
