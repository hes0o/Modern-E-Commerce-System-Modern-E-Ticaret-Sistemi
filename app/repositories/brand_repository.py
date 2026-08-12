from typing import Optional, Union, Any
from sqlmodel import Session, col, select

from app.models.brand import Brand


def get_brands(
    session: Session,
    *,
    include_inactive: bool = False,
    category_id: Optional[int] = None,
) -> list[Brand]:
    statement = select(Brand).order_by(col(Brand.name))

    if not include_inactive:
        statement = statement.where(
            col(Brand.is_active).is_(True)
        )

    if category_id is not None:
        statement = statement.where(
            col(Brand.category_id) == category_id
        )

    return list(session.exec(statement).all())


def get_brand_by_id(
    session: Session,
    brand_id: int,
) -> Optional[Brand]:
    return session.get(Brand, brand_id)


def get_brand_by_name(
    session: Session,
    name: str,
) -> Optional[Brand]:
    statement = select(Brand).where(
        col(Brand.name) == name,
    )
    return session.exec(statement).first()


def save_brand(
    session: Session,
    brand: Brand,
) -> Brand:
    session.add(brand)
    session.commit()
    session.refresh(brand)
    return brand