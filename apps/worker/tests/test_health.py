from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)


def test_health_endpoint():
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "ok"
    assert data["shell_escape"] == "disabled"


def test_formats_endpoint():
    response = client.get("/v1/formats")
    assert response.status_code == 200
    assert len(response.json()["formats"]) >= 10


def test_csl_styles():
    response = client.get("/v1/csl-styles")
    assert response.status_code == 200
    ids = [s["id"] for s in response.json()["styles"]]
    assert "apa" in ids
