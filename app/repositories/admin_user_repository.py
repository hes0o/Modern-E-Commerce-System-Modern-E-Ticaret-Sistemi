from sqlalchemy import func, or_
from sqlalchemy.orm import selectinload
from sqlmodel import Session, col, select

from app.models.rbac import Role
from app.models.user import User


def get_admin_users(
    session: Session,
    *,
    page: int,
    page_size: int,
    search: str | None = None,
    role_name: str | None = None,
    is_active: bool | None = None,
) -> tuple[list[User], int]:
    statement = (
        select(User)
        .join(Role)
        .options(selectinload(User.role))
    )
    count_statement = (
        select(func.count())
        .select_from(User)
        .join(Role)
    )

    if search:
        search_term = f"%{search.strip()}%"
        condition = or_(
            col(User.name).ilike(search_term),
            col(User.email).ilike(search_term),
            col(User.phone).ilike(search_term),
        )
        statement = statement.where(condition)
        count_statement = count_statement.where(condition)

    if role_name:
        condition = col(Role.name) == role_name
        statement = statement.where(condition)
        count_statement = count_statement.where(condition)

    if is_active is not None:
        condition = col(User.is_active) == is_active
        statement = statement.where(condition)
        count_statement = count_statement.where(condition)

    statement = (
        statement.order_by(col(User.created_at).desc())
        .offset((page - 1) * page_size)
        .limit(page_size)
    )

    users = list(session.exec(statement).all())
    total = session.exec(count_statement).one()

    return users, total


def get_admin_user_by_id(
    session: Session,
    user_id: int,
) -> User | None:
    statement = (
        select(User)
        .where(User.id == user_id)
        .options(selectinload(User.role))
    )
    return session.exec(statement).first()


def save_admin_user(
    session: Session,
    user: User,
) -> User:
    session.add(user)
    session.commit()
    session.refresh(user)

    saved_user = get_admin_user_by_id(session, user.id)
    return saved_user or user