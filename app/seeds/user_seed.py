"""
Demo/default user seed — creates the admin and personnel accounts
referenced by the login screens and README (SRS §17.2).

Without this seed, the system has roles/permissions but no actual
user to log in with, which blocks first-time setup entirely.
"""

from sqlmodel import Session, select

from app.core.security import password_hash
from app.models.user import User

DEFAULT_USERS = [
    {
        "name": "Admin",
        "email": "admin@example.com",
        "password": "Admin123!",
        "role_name": "admin",
    },
    {
        "name": "Personel",
        "email": "employee@example.com",
        "password": "Emp123!",
        "role_name": "personnel",
    },
]


def seed_users(session: Session, role_ids: dict[str, int]) -> None:
    """Create default admin/personnel users if they don't already exist."""
    for user_data in DEFAULT_USERS:
        existing = session.exec(
            select(User).where(User.email == user_data["email"])
        ).first()

        if existing:
            continue

        role_id = role_ids.get(user_data["role_name"])
        if role_id is None:
            continue

        user = User(
            name=user_data["name"],
            email=user_data["email"],
            password_hash=password_hash.hash(user_data["password"]),
            role_id=role_id,
            is_active=True,
        )
        session.add(user)

    session.commit()