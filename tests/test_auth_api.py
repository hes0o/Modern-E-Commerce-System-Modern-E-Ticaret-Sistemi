from datetime import UTC, datetime, timedelta

from sqlmodel import Session, select

from app.core.config import settings
from app.models.user import User


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

def test_account_is_locked_after_repeated_failures(client):
    email = "locked.user@example.com"
    client.post(
        "/api/auth/register",
        json={
            "name": "Kilit Test Kullanıcısı",
            "email": email,
            "phone": None,
            "password": "Test1234!",
            "password_confirm": "Test1234!",
            "kvkk_accepted": True,
            "newsletter_allowed": False,
        },
    )

    for attempt in range(settings.login_max_failed_attempts):
        response = client.post(
            "/api/auth/login",
            json={
                "email": email,
                "password": "Wrong1234!",
            },
        )

        if attempt < settings.login_max_failed_attempts - 1:
            assert response.status_code == 401
        else:
            assert response.status_code == 403

    correct_password_response = client.post(
        "/api/auth/login",
        json={
            "email": email,
            "password": "Test1234!",
        },
    )

    assert correct_password_response.status_code == 403
    assert "geçici olarak kilitlendi" in (
        correct_password_response.json()["message"]
    )


def test_expired_lock_allows_login(client, engine):
    email = "expired.lock@example.com"
    client.post(
        "/api/auth/register",
        json={
            "name": "Süresi Dolmuş Kilit",
            "email": email,
            "phone": None,
            "password": "Test1234!",
            "password_confirm": "Test1234!",
            "kvkk_accepted": True,
            "newsletter_allowed": False,
        },
    )

    for _ in range(settings.login_max_failed_attempts):
        client.post(
            "/api/auth/login",
            json={
                "email": email,
                "password": "Wrong1234!",
            },
        )

    with Session(engine) as session:
        user = session.exec(
            select(User).where(User.email == email)
        ).one()
        user.locked_until = (
            datetime.now(UTC) - timedelta(minutes=1)
        )
        session.add(user)
        session.commit()

    response = client.post(
        "/api/auth/login",
        json={
            "email": email,
            "password": "Test1234!",
        },
    )

    assert response.status_code == 200
    assert response.json()["success"] is True