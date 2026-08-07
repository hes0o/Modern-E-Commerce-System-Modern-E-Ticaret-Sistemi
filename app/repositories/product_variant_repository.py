from typing import Optional, Union, Any
from sqlmodel import Session, col, select

from app.models.product import ProductVariant


def get_product_variants(
    session: Session,
    product_id: int,
) -> list[ProductVariant]:
    statement = (
        select(ProductVariant)
        .where(
            col(ProductVariant.product_id) == product_id
        )
        .order_by(col(ProductVariant.created_at))
    )
    return list(session.exec(statement).all())


def get_variant_by_id_and_product_id(
    session: Session,
    *,
    variant_id: int,
    product_id: int,
) -> Optional[ProductVariant]:
    statement = select(ProductVariant).where(
        col(ProductVariant.id) == variant_id,
        col(ProductVariant.product_id) == product_id,
    )
    return session.exec(statement).first()


def get_variant_by_sku(
    session: Session,
    sku: str,
) -> Optional[ProductVariant]:
    statement = select(ProductVariant).where(
        col(ProductVariant.sku) == sku,
    )
    return session.exec(statement).first()


def save_variant(
    session: Session,
    variant: ProductVariant,
) -> ProductVariant:
    session.add(variant)
    session.commit()
    session.refresh(variant)
    return variant


def delete_variant(
    session: Session,
    variant: ProductVariant,
) -> None:
    session.delete(variant)
    session.commit()