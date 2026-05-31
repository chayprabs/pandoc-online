from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)


def test_inspect_html_img_src():
    response = client.post(
        "/v1/inspect",
        json={
            "source": {
                "format": "html",
                "content": '<html><body><img src="assets/pic.png" alt="x"></body></html>',
            },
        },
    )
    assert response.status_code == 200
    assert "assets/pic.png" in response.json()["assets"]


def test_inspect_rst_image():
    response = client.post(
        "/v1/inspect",
        json={
            "source": {
                "format": "rst",
                "content": "Title\n=====\n\n.. image:: pic.png\n",
            },
        },
    )
    assert response.status_code == 200
    assert "pic.png" in response.json()["assets"]
