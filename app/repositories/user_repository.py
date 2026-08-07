from typing import Optional, Union, Any
from sqlalchemy import func
from sqlmodel import Session, select

from app.models.user import User


def get_user_by_email(
    session: Session,
    email: str,
) -> Optional[User]:
    statement = select(User).where(
        func.lower(User.email) == email.lower()
    )

    return session.exec(statement).first()


def get_user_by_id(
    session: Session,
    user_id: int,
) -> Optional[User]:
    return session.get(User, user_id)


def create_user(
    session: Session,
    user: User,
) -> User:
    session.add(user)
    session.flush()
    session.refresh(user)

    return user