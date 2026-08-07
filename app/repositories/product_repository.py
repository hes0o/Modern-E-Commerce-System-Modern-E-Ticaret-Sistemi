from typing import Optional, Union, Any
from sqlalchemy import func, or_
from sqlmodel import Session, col, select

from app.models.enums import ProductStatus
from app.models.product import Product


def get_products(
    session: Session,
    *,
    page: int = 1,
    page_size: int = 20,
    search: Optional[str] = None,
    category_id: Optional[int] = None,
    status: Optional[ProductStatus] = ProductStatus.PUBLISHED,
) -> tuple[list[Product], int]:
    statement = select(Product)
    count_statement = select(func.count()).select_from(Product)

    if status is not None:
        status_condition = col(Product.status) == status
        statement = statement.where(status_condition)
        count_statement = count_statement.where(status_condition)

    if category_id is not None:
        category_condition = (
            col(Product.category_id) == category_id
        )
        statement = statement.where(category_condition)
        count_statement = count_statement.where(
            category_condition,
        )

    if search:
        search_term = f"%{search.strip()}%"
        search_condition = or_(
            col(Product.name).ilike(search_term),
            col(Product.sku).ilike(search_term),
            col(Product.slug).ilike(search_term),
        )
        statement = statement.where(search_condition)
        count_statement = count_statement.where(
            search_condition,
        )

    statement = (
        statement.order_by(
            col(Product.created_at).desc(),
        )
        .offset((page - 1) * page_size)
        .limit(page_size)
    )

    products = list(session.exec(statement).all())
    total = session.exec(count_statement).one()

    return products, total


def get_product_by_id(
    session: Session,
    product_id: int,
) -> Optional[Product]:
    return session.get(Product, product_id)


def get_product_by_slug(
    session: Session,
    slug: str,
) -> Optional[Product]:
    statement = select(Product).where(
        col(Product.slug) == slug,
    )
    return session.exec(statement).first()


def get_product_by_sku(
    session: Session,
    sku: str,
) -> Optional[Product]:
    statement = select(Product).where(
        col(Product.sku) == sku,
    )
    return session.exec(statement).first()


def get_product_by_barcode(
    session: Session,
    barcode: str,
) -> Optional[Product]:
    statement = select(Product).where(
        col(Product.barcode) == barcode,
    )
    return session.exec(statement).first()


def create_product(
    session: Session,
    product: Product,
) -> Product:
    session.add(product)
    session.commit()
    session.refresh(product)
    return product


def update_product(
    session: Session,
    product: Product,
) -> Product:
    session.add(product)
    session.commit()
    session.refresh(product)
    return product