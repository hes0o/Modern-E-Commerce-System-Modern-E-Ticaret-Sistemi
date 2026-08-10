from app.core.config import settings


def test_maintenance_mode_blocks_customer_api(
    client,
    monkeypatch,
):
    monkeypatch.setattr(
        settings,
        "maintenance_mode",
        True,
    )

    response = client.get("/api/categories")

    assert response.status_code == 503
    assert response.json()["success"] is False
    assert response.headers["Retry-After"] == "300"


def test_maintenance_mode_keeps_admin_and_login_available(
    client,
    monkeypatch,
):
    monkeypatch.setattr(
        settings,
        "maintenance_mode",
        True,
    )

    admin_response = client.get("/api/admin/dashboard")
    login_response = client.post(
        "/api/auth/login",
        json={
            "email": "unknown@example.com",
            "password": "Unknown123!",
        },
    )
    docs_response = client.get("/docs")

    assert admin_response.status_code == 401
    assert login_response.status_code == 401
    assert docs_response.status_code == 200