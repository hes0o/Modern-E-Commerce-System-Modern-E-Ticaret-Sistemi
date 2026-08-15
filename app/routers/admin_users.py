from typing import Optional, Union, Any
from typing import Annotated

from fastapi import APIRouter, Depends, Query, status
from sqlmodel import Session

from app.core.dependencies import require_permission
from app.database import get_session
from app.models.user import User
from app.schemas.admin_user import (
    AdminRoleName,
    AdminUserCreate,
    AdminUserListResponse,
    AdminUserResponse,
    AdminUserUpdate,
)
from app.schemas.common import ApiResponse
from app.services.admin_user_service import (
    create_admin_user,
    delete_admin_user,
    get_admin_user,
    list_admin_users,
    update_admin_user,
)

router = APIRouter(
    prefix="/api/admin/users",
    tags=["Admin Users"],
)


@router.get(
    "",
    response_model=ApiResponse[AdminUserListResponse],
)
def admin_user_list(
    session: Annotated[Session, Depends(get_session)],
    _admin: Annotated[User, Depends(require_permission("user.read"))],
    page: Annotated[int, Query(ge=1)] = 1,
    page_size: Annotated[int, Query(ge=1, le=100)] = 20,
    search: Optional[str] = None,
    role_name: Optional[AdminRoleName] = None,
    is_active: Optional[bool] = None,
) -> ApiResponse[AdminUserListResponse]:
    users = list_admin_users(
        session,
        page=page,
        page_size=page_size,
        search=search,
        role_name=role_name,
        is_active=is_active,
    )

    return ApiResponse(
        success=True,
        data=users,
        message="Kullanıcılar getirildi.",
    )


@router.get(
    "/{user_id}",
    response_model=ApiResponse[AdminUserResponse],
)
def admin_user_detail(
    user_id: int,
    session: Annotated[Session, Depends(get_session)],
    _admin: Annotated[User, Depends(require_permission("user.read"))],
) -> ApiResponse[AdminUserResponse]:
    user = get_admin_user(session, user_id)

    return ApiResponse(
        success=True,
        data=user,
        message="Kullanıcı getirildi.",
    )


@router.post(
    "",
    response_model=ApiResponse[AdminUserResponse],
    status_code=status.HTTP_201_CREATED,
)
def create_user(
    payload: AdminUserCreate,
    session: Annotated[Session, Depends(get_session)],
    _admin: Annotated[User, Depends(require_permission("user.create", "user.assign_role"))],
) -> ApiResponse[AdminUserResponse]:
    user = create_admin_user(session, payload)

    return ApiResponse(
        success=True,
        data=user,
        message="Kullanıcı başarıyla oluşturuldu.",
    )


@router.patch(
    "/{user_id}",
    response_model=ApiResponse[AdminUserResponse],
)
def update_user(
    user_id: int,
    payload: AdminUserUpdate,
    session: Annotated[Session, Depends(get_session)],
    admin: Annotated[User, Depends(require_permission("user.update", "user.assign_role"))],
) -> ApiResponse[AdminUserResponse]:
    user = update_admin_user(
        session,
        user_id=user_id,
        current_admin_id=admin.id,
        payload=payload,
    )

    return ApiResponse(
        success=True,
        data=user,
        message="Kullanıcı başarıyla güncellendi.",
    )


@router.delete(
    "/{user_id}",
    response_model=ApiResponse[None],
)
def delete_user(
    user_id: int,
    session: Annotated[Session, Depends(get_session)],
    admin: Annotated[User, Depends(require_permission("user.delete"))],
) -> ApiResponse[None]:
    delete_admin_user(
        session,
        user_id=user_id,
        current_admin_id=admin.id,
    )

    return ApiResponse(
        success=True,
        data=None,
        message="Kullanıcı veritabanından kalıcı olarak silindi.",
    )