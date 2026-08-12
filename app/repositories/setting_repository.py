from typing import Optional, Union, Any
from sqlmodel import Session, col, select

from app.models.setting import Setting


def get_settings(
    session: Session,
    *,
    group: Optional[str] = None,
) -> list[Setting]:
    statement = select(Setting)

    if group is not None:
        statement = statement.where(
            col(Setting.group) == group
        )

    statement = statement.order_by(
        col(Setting.group),
        col(Setting.key),
    )
    return list(session.exec(statement).all())


def get_setting_by_id(
    session: Session,
    setting_id: int,
) -> Optional[Setting]:
    return session.get(Setting, setting_id)


def get_setting_by_key(
    session: Session,
    key: str,
) -> Optional[Setting]:
    statement = select(Setting).where(
        col(Setting.key) == key,
    )
    return session.exec(statement).first()


def save_setting(
    session: Session,
    setting: Setting,
) -> Setting:
    session.add(setting)
    session.commit()
    session.refresh(setting)
    return setting


def delete_setting(
    session: Session,
    setting: Setting,
) -> None:
    session.delete(setting)
    session.commit()


def upsert_setting_by_key(
    session: Session,
    key: str,
    value: Optional[str],
    group: Optional[str] = None,
) -> Setting:
    """Key varsa güncelle, yoksa oluştur."""
    existing = get_setting_by_key(session, key)
    if existing is not None:
        existing.value = value
        if group is not None:
            existing.group = group
        session.add(existing)
        session.commit()
        session.refresh(existing)
        return existing
    new_setting = Setting(key=key, value=value, group=group)
    session.add(new_setting)
    session.commit()
    session.refresh(new_setting)
    return new_setting