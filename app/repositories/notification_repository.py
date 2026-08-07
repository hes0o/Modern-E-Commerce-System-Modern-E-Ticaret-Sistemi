from typing import Optional, Union, Any
from sqlalchemy import func, or_
from sqlmodel import Session, col, select

from app.models.notification import Notification


def get_notifications(
    session: Session,
    *,
    user_id: int,
    notification_type: Optional[str] = None,
    unread_only: bool = False,
) -> tuple[list[Notification], int, int]:
    visibility_condition = or_(
        col(Notification.recipient_user_id).is_(None),
        col(Notification.recipient_user_id) == user_id,
    )

    statement = select(Notification).where(
        visibility_condition
    )
    count_statement = (
        select(func.count())
        .select_from(Notification)
        .where(visibility_condition)
    )
    unread_count_statement = (
        select(func.count())
        .select_from(Notification)
        .where(
            visibility_condition,
            col(Notification.is_read).is_(False),
        )
    )

    if notification_type:
        type_condition = (
            col(Notification.type) == notification_type
        )
        statement = statement.where(type_condition)
        count_statement = count_statement.where(
            type_condition
        )
        unread_count_statement = (
            unread_count_statement.where(type_condition)
        )

    if unread_only:
        unread_condition = col(
            Notification.is_read
        ).is_(False)
        statement = statement.where(unread_condition)
        count_statement = count_statement.where(
            unread_condition
        )

    statement = statement.order_by(
        col(Notification.created_at).desc()
    )

    notifications = list(session.exec(statement).all())
    total = session.exec(count_statement).one()
    unread_count = session.exec(
        unread_count_statement
    ).one()

    return notifications, total, unread_count


def get_visible_notification_by_id(
    session: Session,
    *,
    notification_id: int,
    user_id: int,
) -> Optional[Notification]:
    statement = select(Notification).where(
        col(Notification.id) == notification_id,
        or_(
            col(Notification.recipient_user_id).is_(None),
            col(Notification.recipient_user_id) == user_id,
        ),
    )
    return session.exec(statement).first()


def save_notification(
    session: Session,
    notification: Notification,
) -> Notification:
    session.add(notification)
    session.commit()
    session.refresh(notification)
    return notification


def save_notifications(
    session: Session,
    notifications: list[Notification],
) -> None:
    session.add_all(notifications)
    session.commit()

def delete_notification(
    session: Session,
    notification: Notification,
) -> None:
    session.delete(notification)
    session.commit()