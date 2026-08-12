from typing import Optional

from sqlalchemy import func
from sqlmodel import Session, col, select

from app.models.enums import StockMovementType
from app.models.stock import StockMovement
from app.models.product import Product


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
        statement
        .order_by(
            col(StockMovement.created_at).desc()
        )
        .offset((page - 1) * page_size)
        .limit(page_size)
    )

    movements = list(
        session.exec(statement).all()
    )

    total = session.exec(
        count_statement
    ).one()

    return movements, total


def get_stock_products(
    session: Session,
    *,
    page: int,
    page_size: int,
    search: Optional[str] = None,
    filter_type: Optional[str] = None,
) -> tuple[list[Product], int]:

    statement = select(Product)
    count_statement = (
        select(func.count())
        .select_from(Product)
    )

    # Arama
    if search:
        search_term = f"%{search.strip()}%"

        search_condition = (
            col(Product.name).ilike(search_term)
            | col(Product.sku).ilike(search_term)
        )

        statement = statement.where(search_condition)
        count_statement = count_statement.where(
            search_condition
        )

    # Tükenen ürünler
    if filter_type == "out":
        condition = (
            col(Product.stock).is_not(None)
            & (col(Product.stock) == 0)
        )

        statement = statement.where(condition)
        count_statement = count_statement.where(condition)

    # Azalan stoklar
    elif filter_type == "low":
        condition = (
            col(Product.stock).is_not(None)
            & col(Product.min_stock_level).is_not(None)
            & (col(Product.stock) > 0)
            & (
                col(Product.stock)
                <= col(Product.min_stock_level)
            )
        )

        statement = statement.where(condition)
        count_statement = count_statement.where(condition)

    statement = (
        statement
        .order_by(
            col(Product.created_at).desc()
        )
        .offset((page - 1) * page_size)
        .limit(page_size)
    )

    products = list(
        session.exec(statement).all()
    )

    total = session.exec(
        count_statement
    ).one()

    return products, total