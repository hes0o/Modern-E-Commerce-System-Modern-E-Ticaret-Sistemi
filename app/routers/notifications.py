from typing import Annotated

from fastapi import APIRouter, Depends, Query, status
from sqlmodel import Session

from app.core.dependencies import require_admin
from app.database import get_session
from app.models.user import User
from app.schemas.common import ApiResponse
from app.schemas.notification import (
    NotificationCreate,
    NotificationListResponse,
    NotificationResponse,
)
from app.services.notification_service import (
    create_new_notification,
    list_notifications,
    mark_all_notifications_as_read,
    mark_notification_as_read,
    remove_notification,
)

router = APIRouter(
    prefix="/api/admin/notifications",
    tags=["Notifications"],
)


@router.get(
    "",
    response_model=ApiResponse[NotificationListResponse],
)
def notification_list(
    session: Annotated[Session, Depends(get_session)],
    admin: Annotated[User, Depends(require_admin)],
    notification_type: str | None = None,
    unread_only: Annotated[bool, Query()] = False,
) -> ApiResponse[NotificationListResponse]:
    notifications = list_notifications(
        session,
        user_id=admin.id,
        notification_type=notification_type,
        unread_only=unread_only,
    )

    return ApiResponse(
        success=True,
        data=notifications,
        message="Bildirimler getirildi.",
    )


@router.post(
    "",
    response_model=ApiResponse[NotificationResponse],
    status_code=status.HTTP_201_CREATED,
)
def create_notification(
    payload: NotificationCreate,
    session: Annotated[Session, Depends(get_session)],
    _admin: Annotated[User, Depends(require_admin)],
) -> ApiResponse[NotificationResponse]:
    notification = create_new_notification(
        session,
        payload,
    )

    return ApiResponse(
        success=True,
        data=notification,
        message="Bildirim oluşturuldu.",
    )


@router.patch(
    "/read-all",
    response_model=ApiResponse[dict[str, int]],
)
def read_all_notifications(
    session: Annotated[Session, Depends(get_session)],
    admin: Annotated[User, Depends(require_admin)],
) -> ApiResponse[dict[str, int]]:
    updated_count = mark_all_notifications_as_read(
        session,
        user_id=admin.id,
    )

    return ApiResponse(
        success=True,
        data={"updated_count": updated_count},
        message="Tüm bildirimler okundu olarak işaretlendi.",
    )


@router.patch(
    "/{notification_id}/read",
    response_model=ApiResponse[NotificationResponse],
)
def read_notification(
    notification_id: int,
    session: Annotated[Session, Depends(get_session)],
    admin: Annotated[User, Depends(require_admin)],
) -> ApiResponse[NotificationResponse]:
    notification = mark_notification_as_read(
        session,
        notification_id=notification_id,
        user_id=admin.id,
    )

    return ApiResponse(
        success=True,
        data=notification,
        message="Bildirim okundu olarak işaretlendi.",
    )


@router.delete(
    "/{notification_id}",
    response_model=ApiResponse[None],
)
def delete_notification(
    notification_id: int,
    session: Annotated[Session, Depends(get_session)],
    admin: Annotated[User, Depends(require_admin)],
) -> ApiResponse[None]:
    remove_notification(
        session,
        notification_id=notification_id,
        user_id=admin.id,
    )

    return ApiResponse(
        success=True,
        data=None,
        message="Bildirim silindi.",
    )