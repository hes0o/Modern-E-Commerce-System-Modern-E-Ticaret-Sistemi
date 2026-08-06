def test_register_login_and_get_me(client):
    registration_response = client.post(
        "/api/auth/register",
        json={
            "name": "API Test Kullanıcısı",
            "email": "api.test@example.com",
            "phone": "05551234567",
            "password": "Test1234!",
            "password_confirm": "Test1234!",
            "kvkk_accepted": True,
            "newsletter_allowed": False,
        },
    )

    assert registration_response.status_code == 201
    assert registration_response.json()["success"] is True
    assert registration_response.json()["data"]["email"] == (
        "api.test@example.com"
    )

    login_response = client.post(
        "/api/auth/login",
        json={
            "email": "api.test@example.com",
            "password": "Test1234!",
        },
    )

    assert login_response.status_code == 200
    access_token = login_response.json()["data"]["access_token"]

    me_response = client.get(
        "/api/auth/me",
        headers={
            "Authorization": f"Bearer {access_token}",
        },
    )

    assert me_response.status_code == 200
    assert me_response.json()["success"] is True
    assert me_response.json()["data"]["email"] == (
        "api.test@example.com"
    )
    assert me_response.json()["data"]["role"] == "customer"

def test_login_rejects_wrong_password(client):
    client.post(
        "/api/auth/register",
        json={
            "name": "Yanlış Şifre Testi",
            "email": "wrong.password@example.com",
            "phone": None,
            "password": "Test1234!",
            "password_confirm": "Test1234!",
            "kvkk_accepted": True,
            "newsletter_allowed": False,
        },
    )

    response = client.post(
        "/api/auth/login",
        json={
            "email": "wrong.password@example.com",
            "password": "Wrong1234!",
        },
    )

    assert response.status_code == 401
    assert response.json()["success"] is False


def test_get_me_requires_authentication(client):
    response = client.get("/api/auth/me")

    assert response.status_code == 401
    assert response.json()["success"] is False