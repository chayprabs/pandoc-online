import base64

from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)

PNG_1X1 = base64.b64encode(
    bytes.fromhex(
        "89504e470d0a1a0a0000000d49484452000000010000000108060000001f15c489"
        "0000000a49444154789c6300010000050001"
    )
).decode()


def test_nested_asset_path():
    import shutil

    if not shutil.which("pandoc"):
        import pytest

        pytest.skip("pandoc not installed")
    response = client.post(
        "/v1/convert",
        json={
            "source": {"format": "markdown", "content": "![alt](sub/img.png)"},
            "target": {"format": "html"},
            "assets": [{"name": "sub/img.png", "contentBase64": PNG_1X1}],
        },
    )
    assert response.status_code == 200, response.text
    data = response.json()
    art = client.get(data["artifactUrl"])
    assert art.status_code == 200
    assert "sub/img.png" in art.text or "img.png" in art.text


def test_invalid_binary_source_base64():
    response = client.post(
        "/v1/convert",
        json={
            "source": {"format": "docx", "content": "not-valid-base64!!!"},
            "target": {"format": "html"},
        },
    )
    assert response.status_code == 400
    assert "base64" in response.json()["detail"].lower()


def test_markdown_to_docx():
    import shutil

    if not shutil.which("pandoc"):
        import pytest

        pytest.skip("pandoc not installed")
    response = client.post(
        "/v1/convert",
        json={
            "source": {"format": "markdown", "content": "# Title\n\nBody."},
            "target": {"format": "docx"},
        },
    )
    assert response.status_code == 200, response.text
    job_id = response.json().get("jobId") or response.json().get("job_id")
    art = client.get(f"/v1/jobs/{job_id}/artifact")
    assert art.status_code == 200
    assert len(art.content) > 1000
