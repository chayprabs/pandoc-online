from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)


def test_asset_path_traversal_rejected():
    response = client.post(
        "/v1/convert",
        json={
            "source": {"format": "markdown", "content": "# x"},
            "target": {"format": "html"},
            "assets": [
                {
                    "name": "../../../tmp/evil.txt",
                    "contentBase64": "dGVzdA==",
                }
            ],
        },
    )
    assert response.status_code == 400


def test_invalid_base64_asset():
    response = client.post(
        "/v1/convert",
        json={
            "source": {"format": "markdown", "content": "# x"},
            "target": {"format": "html"},
            "assets": [{"name": "x.png", "contentBase64": "!!!"}],
        },
    )
    assert response.status_code == 400
