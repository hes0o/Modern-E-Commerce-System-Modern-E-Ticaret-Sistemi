from sqlmodel import Session, select

from app.models.rbac import Role


def get_role_by_name(
    session: Session,
    role_name: str,
) -> Role | None:
    statement = select(Role).where(
        Role.name == role_name
    )

    return session.exec(statement).first()