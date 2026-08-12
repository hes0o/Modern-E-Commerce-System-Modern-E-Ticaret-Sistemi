from typing import Optional, Union, Any
from datetime import timezone, datetime

from sqlmodel import Session

from app.core.exceptions import (
    BusinessRuleError,
    ConflictError,
    NotFoundError,
)
from app.models.setting import Setting
from app.repositories.setting_repository import (
    delete_setting,
    get_setting_by_id,
    get_setting_by_key,
    get_settings,
    save_setting,
    upsert_setting_by_key,
)
from app.schemas.setting import (
    SettingCreate,
    SettingResponse,
    SettingUpdate,
)

SENSITIVE_KEY_PARTS = {
    "password",
    "secret",
    "token",
    "private_key",
    "api_key",
}


def ensure_setting_is_not_sensitive(
    key: str,
) -> None:
    normalized_key = key.lower()

    if any(
        part in normalized_key
        for part in SENSITIVE_KEY_PARTS
    ):
        raise BusinessRuleError(
            "Hassas ayarlar veritabanında saklanamaz; "
            "ortam değişkeni kullanılmalıdır."
        )


def list_settings(
    session: Session,
    *,
    group: Optional[str],
) -> list[SettingResponse]:
    settings = get_settings(
        session,
        group=group,
    )

    return [
        SettingResponse.model_validate(setting)
        for setting in settings
    ]


def create_new_setting(
    session: Session,
    payload: SettingCreate,
) -> SettingResponse:
    key = payload.key.strip().lower()
    ensure_setting_is_not_sensitive(key)

    if get_setting_by_key(session, key) is not None:
        raise ConflictError(
            "Bu ayar anahtarı zaten kullanılıyor."
        )

    setting = Setting(
        key=key,
        value=payload.value,
        group=(
            payload.group.strip()
            if payload.group
            else None
        ),
    )
    saved_setting = save_setting(session, setting)

    return SettingResponse.model_validate(
        saved_setting
    )


def update_existing_setting(
    session: Session,
    *,
    setting_id: int,
    payload: SettingUpdate,
) -> SettingResponse:
    setting = get_setting_by_id(session, setting_id)

    if setting is None:
        raise NotFoundError("Ayar bulunamadı.")

    update_data = payload.model_dump(exclude_unset=True)

    if (
        "group" in update_data
        and update_data["group"] is not None
    ):
        update_data["group"] = update_data[
            "group"
        ].strip()

    for field, value in update_data.items():
        setattr(setting, field, value)

    setting.updated_at = datetime.now(timezone.utc)
    saved_setting = save_setting(session, setting)

    return SettingResponse.model_validate(
        saved_setting
    )


def remove_setting(
    session: Session,
    setting_id: int,
) -> None:
    setting = get_setting_by_id(session, setting_id)

    if setting is None:
        raise NotFoundError("Ayar bulunamadı.")

    delete_setting(session, setting)


def upsert_setting(
    session: Session,
    key: str,
    value: str,
    group: str,
) -> SettingResponse:
    """Key varsa değerini güncelle, yoksa yeni kayıt oluştur."""
    key = key.strip().lower()
    ensure_setting_is_not_sensitive(key)
    setting = upsert_setting_by_key(session, key=key, value=value, group=group)
    return SettingResponse.model_validate(setting)