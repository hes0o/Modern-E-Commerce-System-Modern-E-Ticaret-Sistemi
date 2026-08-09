from datetime import UTC, datetime

from sqlmodel import Session

from app.core.exceptions import (
    BusinessRuleError,
    ConflictError,
    NotFoundError,
)
from app.core.security import hash_password
from app.models.user import User
from app.repositories.admin_user_repository import (
    get_admin_user_by_id,
    get_admin_users,
    save_admin_user,
)
from app.repositories.role_repository import get_role_by_name
from app.repositories.user_repository import get_user_by_email
from app.schemas.admin_user import (
    AdminUserCreate,
    AdminUserListResponse,
    AdminUserResponse,
    AdminUserUpdate,
)
from app.services.audit_service import log_role_change


def to_admin_user_response(
    user: User,
) -> AdminUserResponse:
    return AdminUserResponse(
        id=user.id,
        name=user.name,
        email=user.email,
        phone=user.phone,
        role=user.role.name,
        is_active=user.is_active,
        last_login_at=user.last_login_at,
        created_at=user.created_at,
        updated_at=user.updated_at,
    )


def list_admin_users(
    session: Session,
    *,
    page: int,
    page_size: int,
    search: str | None,
    role_name: str | None,
    is_active: bool | None,
) -> AdminUserListResponse:
    users, total = get_admin_users(
        session,
        page=page,
        page_size=page_size,
        search=search,
        role_name=role_name,
        is_active=is_active,
    )

    total_pages = (
        (total + page_size - 1) // page_size
        if total > 0
        else 0
    )

    return AdminUserListResponse(
        items=[
            to_admin_user_response(user)
            for user in users
        ],
        total=total,
        page=page,
        page_size=page_size,
        total_pages=total_pages,
    )


def get_admin_user(
    session: Session,
    user_id: int,
) -> AdminUserResponse:
    user = get_admin_user_by_id(session, user_id)

    if user is None:
        raise NotFoundError("Kullanıcı bulunamadı.")

    return to_admin_user_response(user)


def create_admin_user(
    session: Session,
    payload: AdminUserCreate,
) -> AdminUserResponse:
    email = str(payload.email).strip().lower()

    if get_user_by_email(session, email) is not None:
        raise ConflictError(
            "Bu e-posta adresi zaten kullanılıyor."
        )

    role = get_role_by_name(session, payload.role)

    if role is None:
        raise NotFoundError("Kullanıcı rolü bulunamadı.")

    user = User(
        name=payload.name.strip(),
        email=email,
        phone=payload.phone,
        password_hash=hash_password(payload.password),
        role_id=role.id,
        is_active=payload.is_active,
        newsletter_allowed=False,
    )
    saved_user = save_admin_user(session, user)

    return to_admin_user_response(saved_user)


def update_admin_user(
    session: Session,
    *,
    user_id: int,
    current_admin_id: int,
    payload: AdminUserUpdate,
) -> AdminUserResponse:
    user = get_admin_user_by_id(session, user_id)

    if user is None:
        raise NotFoundError("Kullanıcı bulunamadı.")
    old_role_id = user.role_id
    update_data = payload.model_dump(exclude_unset=True)

    if user_id == current_admin_id:
        if update_data.get("is_active") is False:
            raise BusinessRuleError(
                "Kendi hesabınızı pasif duruma getiremezsiniz."
            )

        requested_role = update_data.get("role")
        if (
            requested_role is not None
            and requested_role != "admin"
        ):
            raise BusinessRuleError(
                "Kendi admin rolünüzü değiştiremezsiniz."
            )

    if "role" in update_data:
        role_name = update_data.pop("role")
        role = get_role_by_name(session, role_name)

        if role is None:
            raise NotFoundError("Kullanıcı rolü bulunamadı.")

        user.role_id = role.id

    if "name" in update_data:
        update_data["name"] = update_data["name"].strip()

    for field, value in update_data.items():
        setattr(user, field, value)

    user.updated_at = datetime.now(UTC)
    if old_role_id != user.role_id:
        log_role_change(
            session,
            target_user_id=user.id,
            old_role_id=old_role_id,
            new_role_id=user.role_id,
            changed_by_user_id=current_admin_id,
        )
    saved_user = save_admin_user(session, user)

    return to_admin_user_response(saved_user)