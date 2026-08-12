from sqlalchemy import func
from sqlalchemy.orm import selectinload
from sqlmodel import Session, col, select

from app.models.enums import OrderStatus
from app.models.order import Order


def get_order_by_id(
    session: Session,
    order_id: int,
) -> Order | None:
    statement = (
        select(Order)
        .where(Order.id == order_id)
        .options(
            selectinload(Order.user),
            selectinload(Order.items),
            selectinload(Order.status_history),
        )
    )
    return session.exec(statement).first()


def get_order_by_number(
    session: Session,
    order_number: str,
) -> Order | None:
    statement = (
        select(Order)
        .where(Order.order_number == order_number)
        .options(
            selectinload(Order.user),
            selectinload(Order.items),
            selectinload(Order.status_history),
        )
    )
    return session.exec(statement).first()


def get_user_orders(
    session: Session,
    *,
    user_id: int,
    page: int,
    page_size: int,
) -> tuple[list[Order], int]:
    condition = Order.user_id == user_id

    statement = (
        select(Order)
        .where(condition)
        .options(
            selectinload(Order.user),
            selectinload(Order.items),
            selectinload(Order.status_history),
        )
        .order_by(col(Order.created_at).desc())
        .offset((page - 1) * page_size)
        .limit(page_size)
    )
    count_statement = (
        select(func.count())
        .select_from(Order)
        .where(condition)
    )

    orders = list(session.exec(statement).all())
    total = session.exec(count_statement).one()

    return orders, total


def get_all_orders(
    session: Session,
    *,
    page: int,
    page_size: int,
    order_status: OrderStatus | None = None,
) -> tuple[list[Order], int]:
    statement = select(Order).options(
        selectinload(Order.user),
        selectinload(Order.items),
        selectinload(Order.status_history),
    )
    count_statement = select(func.count()).select_from(Order)

    if order_status is not None:
        condition = Order.status == order_status
        statement = statement.where(condition)
        count_statement = count_statement.where(condition)

    statement = (
        statement.order_by(col(Order.created_at).desc())
        .offset((page - 1) * page_size)
        .limit(page_size)
    )

    orders = list(session.exec(statement).all())
    total = session.exec(count_statement).one()

    return orders, total