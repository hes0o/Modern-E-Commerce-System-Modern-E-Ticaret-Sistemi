from typing import Optional, Union, Any
from sqlalchemy.orm import selectinload
from sqlmodel import Session, col, select

from app.models.rbac import Permission, Role


def get_roles_with_permissions(
    session: Session,
) -> list[Role]:
    statement = (
        select(Role)
        .options(selectinload(Role.permissions))
        .order_by(col(Role.name))
    )
    return list(session.exec(statement).all())


def get_role_with_permissions(
    session: Session,
    role_id: int,
) -> Optional[Role]:
    statement = (
        select(Role)
        .where(Role.id == role_id)
        .options(selectinload(Role.permissions))
    )
    return session.exec(statement).first()


def get_all_permissions(
    session: Session,
) -> list[Permission]:
    statement = select(Permission).order_by(
        col(Permission.name)
    )
    return list(session.exec(statement).all())


def get_permissions_by_ids(
    session: Session,
    permission_ids: list[int],
) -> list[Permission]:
    if not permission_ids:
        return []

    statement = select(Permission).where(
        col(Permission.id).in_(permission_ids)
    )
    return list(session.exec(statement).all())


def save_role(
    session: Session,
    role: Role,
) -> Role:
    session.add(role)
    session.commit()

    saved_role = get_role_with_permissions(
        session,
        role.id,
    )
    return saved_role or role