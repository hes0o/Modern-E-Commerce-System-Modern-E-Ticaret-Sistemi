from datetime import UTC, datetime

from sqlmodel import Session

from app.core.exceptions import (
    BusinessRuleError,
    NotFoundError,
)
from app.repositories.rbac_repository import (
    get_all_permissions,
    get_permissions_by_ids,
    get_role_with_permissions,
    get_roles_with_permissions,
    save_role,
)
from app.schemas.rbac import (
    PermissionResponse,
    RolePermissionUpdate,
    RoleResponse,
)
from app.services.audit_service import log_action


def list_roles(
    session: Session,
) -> list[RoleResponse]:
    roles = get_roles_with_permissions(session)

    return [
        RoleResponse.model_validate(role)
        for role in roles
    ]


def list_permissions(
    session: Session,
) -> list[PermissionResponse]:
    permissions = get_all_permissions(session)

    return [
        PermissionResponse.model_validate(permission)
        for permission in permissions
    ]


def update_role_permissions(
    session: Session,
    *,
    role_id: int,
    payload: RolePermissionUpdate,
    changed_by_user_id: int | None = None,
) -> RoleResponse:
    role = get_role_with_permissions(
        session,
        role_id,
    )

    if role is None:
        raise NotFoundError("Rol bulunamadı.")

    if role.name in {"admin", "customer"}:
        raise BusinessRuleError(
            "Admin ve müşteri rollerinin izinleri değiştirilemez."
        )

    old_permission_ids = sorted(
        permission.id for permission in role.permissions
    )
    permission_ids = list(
        dict.fromkeys(payload.permission_ids)
    )
    permissions = get_permissions_by_ids(
        session,
        permission_ids,
    )

    if len(permissions) != len(permission_ids):
        raise NotFoundError(
            "Seçilen izinlerden biri veya birkaçı bulunamadı."
        )

    role.permissions = permissions
    role.updated_at = datetime.now(UTC)

    log_action(
        session,
        user_id=changed_by_user_id,
        action="role.permissions_updated",
        entity_type="roles",
        entity_id=role.id,
        old_value={"permission_ids": old_permission_ids},
        new_value={"permission_ids": sorted(permission_ids)},
    )

    saved_role = save_role(session, role)

    return RoleResponse.model_validate(saved_role)