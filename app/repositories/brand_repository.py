from sqlmodel import Session, col, select

from app.models.brand import Brand


def get_brands(
    session: Session,
    *,
    include_inactive: bool = False,
) -> list[Brand]:
    statement = select(Brand).order_by(col(Brand.name))

    if not include_inactive:
        statement = statement.where(
            col(Brand.is_active).is_(True)
        )

    return list(session.exec(statement).all())


def get_brand_by_id(
    session: Session,
    brand_id: int,
) -> Brand | None:
    return session.get(Brand, brand_id)


def get_brand_by_name(
    session: Session,
    name: str,
) -> Brand | None:
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