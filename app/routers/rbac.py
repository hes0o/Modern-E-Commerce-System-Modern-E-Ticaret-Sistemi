from typing import Annotated

from fastapi import APIRouter, Depends
from sqlmodel import Session

from app.core.dependencies import require_permission
from app.database import get_session
from app.models.user import User
from app.schemas.common import ApiResponse
from app.schemas.rbac import (
    PermissionResponse,
    RolePermissionUpdate,
    RoleResponse,
)
from app.services.rbac_service import (
    list_permissions,
    list_roles,
    update_role_permissions,
)

router = APIRouter(
    prefix="/api/admin/rbac",
    tags=["Roles & Permissions"],
)


@router.get(
    "/roles",
    response_model=ApiResponse[list[RoleResponse]],
)
def role_list(
    session: Annotated[Session, Depends(get_session)],
    _admin: Annotated[User, Depends(require_permission("user.assign_role"))],
) -> ApiResponse[list[RoleResponse]]:
    roles = list_roles(session)

    return ApiResponse(
        success=True,
        data=roles,
        message="Roller getirildi.",
    )


@router.get(
    "/permissions",
    response_model=ApiResponse[list[PermissionResponse]],
)
def permission_list(
    session: Annotated[Session, Depends(get_session)],
    _admin: Annotated[User, Depends(require_permission("user.assign_role"))],
) -> ApiResponse[list[PermissionResponse]]:
    permissions = list_permissions(session)

    return ApiResponse(
        success=True,
        data=permissions,
        message="İzinler getirildi.",
    )


@router.put(
    "/roles/{role_id}/permissions",
    response_model=ApiResponse[RoleResponse],
)
def replace_role_permissions(
    role_id: int,
    payload: RolePermissionUpdate,
    session: Annotated[Session, Depends(get_session)],
    admin: Annotated[User, Depends(require_permission("user.assign_role"))],
) -> ApiResponse[RoleResponse]:
    role = update_role_permissions(
        session,
        role_id=role_id,
        payload=payload,
        changed_by_user_id=admin.id,
    )

    return ApiResponse(
        success=True,
        data=role,
        message="Rol izinleri güncellendi.",
    )