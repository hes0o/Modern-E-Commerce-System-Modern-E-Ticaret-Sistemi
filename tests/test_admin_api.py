from sqlmodel import Session, select

from app.models.rbac import Role
from app.models.user import User


def register_and_login(client, email: str) -> str:
    client.post(
        "/api/auth/register",
        json={
            "name": "Yetki Test Kullanıcısı",
            "email": email,
            "phone": "05551234567",
            "password": "Test1234!",
            "password_confirm": "Test1234!",
            "kvkk_accepted": True,
            "newsletter_allowed": False,
        },
    )

    login_response = client.post(
        "/api/auth/login",
        json={
            "email": email,
            "password": "Test1234!",
        },
    )

    return login_response.json()["data"]["access_token"]


def create_admin_token(client, engine) -> str:
    email = "admin.api@example.com"

    client.post(
        "/api/auth/register",
        json={
            "name": "Admin API Testi",
            "email": email,
            "phone": "05551234567",
            "password": "Test1234!",
            "password_confirm": "Test1234!",
            "kvkk_accepted": True,
            "newsletter_allowed": False,
        },
    )

    with Session(engine) as session:
        user = session.exec(
            select(User).where(User.email == email)
        ).one()
        admin_role = session.exec(
            select(Role).where(Role.name == "admin")
        ).one()

        user.role_id = admin_role.id
        session.add(user)
        session.commit()

    login_response = client.post(
        "/api/auth/login",
        json={
            "email": email,
            "password": "Test1234!",
        },
    )

    return login_response.json()["data"]["access_token"]


def test_customer_cannot_access_admin_dashboard(client):
    token = register_and_login(
        client,
        "customer.forbidden@example.com",
    )

    response = client.get(
        "/api/admin/dashboard",
        headers={
            "Authorization": f"Bearer {token}",
        },
    )

    assert response.status_code == 403
    assert response.json()["success"] is False


def test_admin_can_access_dashboard(client, engine):
    token = create_admin_token(client, engine)

    response = client.get(
        "/api/admin/dashboard",
        headers={
            "Authorization": f"Bearer {token}",
        },
    )

    assert response.status_code == 200
    assert response.json()["success"] is True
    assert "daily_order_count" in response.json()["data"]
    assert "monthly_revenue" in response.json()["data"]