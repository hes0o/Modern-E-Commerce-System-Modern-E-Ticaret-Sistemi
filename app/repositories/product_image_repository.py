from typing import Optional, Union, Any
from sqlmodel import Session, col, select

from app.models.product import ProductImage


def get_product_images(
    session: Session,
    product_id: int,
) -> list[ProductImage]:
    statement = (
        select(ProductImage)
        .where(
            col(ProductImage.product_id) == product_id
        )
        .order_by(
            col(ProductImage.is_cover).desc(),
            col(ProductImage.sort_order),
        )
    )
    return list(session.exec(statement).all())


def get_image_by_id_and_product_id(
    session: Session,
    *,
    image_id: int,
    product_id: int,
) -> Optional[ProductImage]:
    statement = select(ProductImage).where(
        col(ProductImage.id) == image_id,
        col(ProductImage.product_id) == product_id,
    )
    return session.exec(statement).first()


def save_product_image(
    session: Session,
    image: ProductImage,
) -> ProductImage:
    session.add(image)
    session.commit()
    session.refresh(image)
    return image


def save_product_images(
    session: Session,
    images: list[ProductImage],
) -> None:
    session.add_all(images)
    session.commit()


def delete_product_image(
    session: Session,
    image: ProductImage,
) -> None:
    session.delete(image)
    session.commit()