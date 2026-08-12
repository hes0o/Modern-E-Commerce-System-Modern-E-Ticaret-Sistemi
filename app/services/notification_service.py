from typing import Optional, Union, Any
from datetime import timezone, datetime
from sqlmodel import Session, col, select

from app.core.exceptions import NotFoundError
from app.models.notification import Notification
from app.models.product import Product, ProductVariant
from app.models.user import User
from app.repositories.notification_repository import (
    delete_notification,
    get_notifications,
    get_visible_notification_by_id,
    save_notification,
    save_notifications,
)
from app.schemas.notification import (
    NotificationCreate,
    NotificationListResponse,
    NotificationResponse,
)


def sync_dynamic_notifications(session: Session, user_id: int) -> None:
    """
    Stok seviyelerini kontrol eder ve mevcut kritik stoktaki ürünler için
    veritabanında aktif bildirim yoksa otomatik veritabanına ekler.
    """
    try:
        # 1. Düşük stoklu ürünleri bul
        low_products = session.exec(
            select(Product).where(
                col(Product.has_variants).is_(False),
                col(Product.stock).is_not(None),
                col(Product.min_stock_level).is_not(None),
                col(Product.stock) <= col(Product.min_stock_level),
            )
        ).all()

        for p in low_products:
            # Bu ürün için okunmamış stok bildirimi var mı?
            existing = session.exec(
                select(Notification).where(
                    col(Notification.type) == "stock",
                    col(Notification.related_entity_id) == p.id,
                    col(Notification.is_read).is_(False),
                )
            ).first()

            if not existing:
                notif = Notification(
                    type="stock",
                    title="Kritik Stok Uyarısı",
                    message=f"{p.name} ürününün stoğu kritik seviyeye ({p.stock} adet) düştü.",
                    related_entity_type="product",
                    related_entity_id=p.id,
                    is_read=False,
                )
                session.add(notif)

        session.commit()
    except Exception as e:
        session.rollback()
        print(f"Bildirim senkronizasyon hatası: {e}")


def list_notifications(
    session: Session,
    *,
    user_id: int,
    notification_type: Optional[str],
    unread_only: bool,
) -> NotificationListResponse:
    # İnceleme anında dinamik durumları veritabanına senkronize et
    sync_dynamic_notifications(session, user_id)

    notifications, total, unread_count = get_notifications(
        session,
        user_id=user_id,
        notification_type=notification_type,
        unread_only=unread_only,
    )

    return NotificationListResponse(
        items=[
            NotificationResponse.model_validate(notification)
            for notification in notifications
        ],
        total=total,
        unread_count=unread_count,
    )


def create_new_notification(
    session: Session,
    payload: NotificationCreate,
) -> NotificationResponse:
    if payload.recipient_user_id is not None:
        recipient = session.get(
            User,
            payload.recipient_user_id,
        )
        if recipient is None:
            raise NotFoundError(
                "Bildirim alıcısı bulunamadı."
            )

    notification = Notification(
        type=payload.type.strip(),
        title=payload.title.strip(),
        message=payload.message.strip(),
        related_entity_type=payload.related_entity_type,
        related_entity_id=payload.related_entity_id,
        is_read=False,
        recipient_user_id=payload.recipient_user_id,
    )
    saved_notification = save_notification(
        session,
        notification,
    )

    return NotificationResponse.model_validate(
        saved_notification
    )


def mark_notification_as_read(
    session: Session,
    *,
    notification_id: int,
    user_id: int,
) -> NotificationResponse:
    notification = get_visible_notification_by_id(
        session,
        notification_id=notification_id,
        user_id=user_id,
    )

    if notification is None:
        raise NotFoundError("Bildirim bulunamadı.")

    notification.is_read = True
    notification.updated_at = datetime.now(timezone.utc)
    saved_notification = save_notification(
        session,
        notification,
    )

    return NotificationResponse.model_validate(
        saved_notification
    )


def mark_all_notifications_as_read(
    session: Session,
    *,
    user_id: int,
) -> int:
    notifications, _, _ = get_notifications(
        session,
        user_id=user_id,
        unread_only=True,
    )

    if not notifications:
        return 0

    updated_at = datetime.now(timezone.utc)

    for notification in notifications:
        notification.is_read = True
        notification.updated_at = updated_at

    save_notifications(session, notifications)
    return len(notifications)


def remove_notification(
    session: Session,
    *,
    notification_id: int,
    user_id: int,
) -> None:
    notification = get_visible_notification_by_id(
        session,
        notification_id=notification_id,
        user_id=user_id,
    )

    if notification is None:
        raise NotFoundError("Bildirim bulunamadı.")

    delete_notification(session, notification)