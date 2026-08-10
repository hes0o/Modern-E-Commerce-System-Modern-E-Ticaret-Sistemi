from typing import Annotated

from fastapi import APIRouter, Depends, status
from sqlmodel import Session

from app.core.dependencies import require_permission
from app.core.exceptions import BusinessRuleError
from app.database import get_session
from app.models.user import User
from app.schemas.common import ApiResponse
from app.schemas.setting import (
    EmailTestRequest,
    SettingCreate,
    SettingResponse,
    SettingUpdate,
)
from app.services.email_service import send_email
from app.services.setting_service import (
    create_new_setting,
    list_settings,
    remove_setting,
    update_existing_setting,
)

router = APIRouter(
    prefix="/api/admin/settings",
    tags=["Settings"],
)


@router.get(
    "",
    response_model=ApiResponse[list[SettingResponse]],
)
def setting_list(
    session: Annotated[Session, Depends(get_session)],
    _admin: Annotated[User, Depends(require_permission("settings.read"))],
    group: str | None = None,
) -> ApiResponse[list[SettingResponse]]:
    settings = list_settings(
        session,
        group=group,
    )

    return ApiResponse(
        success=True,
        data=settings,
        message="Sistem ayarları getirildi.",
    )


@router.post(
    "",
    response_model=ApiResponse[SettingResponse],
    status_code=status.HTTP_201_CREATED,
)
def create_setting(
    payload: SettingCreate,
    session: Annotated[Session, Depends(get_session)],
    _admin: Annotated[User, Depends(require_permission("settings.update"))],
) -> ApiResponse[SettingResponse]:
    setting = create_new_setting(session, payload)

    return ApiResponse(
        success=True,
        data=setting,
        message="Sistem ayarı oluşturuldu.",
    )

@router.post(
    "/test-email",
    response_model=ApiResponse[None],
)
def test_email_configuration(
    payload: EmailTestRequest,
    _admin: Annotated[
        User,
        Depends(require_permission("settings.update")),
    ],
) -> ApiResponse[None]:
    sent = send_email(
        recipient=str(payload.recipient),
        subject="SMTP Bağlantı Testi",
        body=(
            "Modern E-Ticaret sistemi SMTP bağlantısı "
            "başarıyla çalışıyor."
        ),
    )

    if not sent:
        raise BusinessRuleError(
            "Test e-postası gönderilemedi. "
            "SMTP ayarlarını kontrol edin."
        )

    return ApiResponse(
        success=True,
        data=None,
        message="Test e-postası başarıyla gönderildi.",
    )

@router.patch(
    "/{setting_id}",
    response_model=ApiResponse[SettingResponse],
)
def update_setting(
    setting_id: int,
    payload: SettingUpdate,
    session: Annotated[Session, Depends(get_session)],
    _admin: Annotated[User, Depends(require_permission("settings.update"))],
) -> ApiResponse[SettingResponse]:
    setting = update_existing_setting(
        session,
        setting_id=setting_id,
        payload=payload,
    )

    return ApiResponse(
        success=True,
        data=setting,
        message="Sistem ayarı güncellendi.",
    )


@router.delete(
    "/{setting_id}",
    response_model=ApiResponse[None],
)
def delete_setting(
    setting_id: int,
    session: Annotated[Session, Depends(get_session)],
    _admin: Annotated[User, Depends(require_permission("settings.update"))],
) -> ApiResponse[None]:
    remove_setting(session, setting_id)

    return ApiResponse(
        success=True,
        data=None,
        message="Sistem ayarı silindi.",
    )