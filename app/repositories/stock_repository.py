from typing import Optional, Union, Any
from sqlalchemy import func
from sqlmodel import Session, col, select

from app.models.enums import StockMovementType
from app.models.stock import StockMovement


def get_stock_movements(
    session: Session,
    *,
    page: int,
    page_size: int,
    product_id: Optional[int] = None,
    variant_id: Optional[int] = None,
    movement_type: Optional[StockMovementType] = None,
) -> tuple[list[StockMovement], int]:
    statement = select(StockMovement)
    count_statement = (
        select(func.count())
        .select_from(StockMovement)
    )

    if product_id is not None:
        condition = (
            col(StockMovement.product_id) == product_id
        )
        statement = statement.where(condition)
        count_statement = count_statement.where(condition)

    if variant_id is not None:
        condition = (
            col(StockMovement.variant_id) == variant_id
        )
        statement = statement.where(condition)
        count_statement = count_statement.where(condition)

    if movement_type is not None:
        condition = (
            col(StockMovement.movement_type)
            == movement_type
        )
        statement = statement.where(condition)
        count_statement = count_statement.where(condition)

    statement = (
        statement.order_by(
            col(StockMovement.created_at).desc()
        )
        .offset((page - 1) * page_size)
        .limit(page_size)
    )

    movements = list(session.exec(statement).all())
    total = session.exec(count_statement).one()

    return movements, total