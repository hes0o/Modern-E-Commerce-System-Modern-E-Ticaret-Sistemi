from sqlalchemy import func, or_
from sqlalchemy.orm import selectinload
from sqlmodel import Session, col, select

from app.models.enums import ProductStatus
from app.models.product import Product


def get_products(
    session: Session,
    *,
    page: int = 1,
    page_size: int = 20,
    search: str | None = None,
    category_id: int | None = None,
    status: ProductStatus | None = ProductStatus.PUBLISHED,
    brand_id: int | None = None,
    price_min: float | None = None,
    price_max: float | None = None,
    sort_by: str | None = None,
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

    if brand_id is not None:
        brand_condition = col(Product.brand_id) == brand_id
        statement = statement.where(brand_condition)
        count_statement = count_statement.where(brand_condition)

    if price_min is not None:
        statement = statement.where(col(Product.price) >= price_min)
        count_statement = count_statement.where(col(Product.price) >= price_min)

    if price_max is not None:
        statement = statement.where(col(Product.price) <= price_max)
        count_statement = count_statement.where(col(Product.price) <= price_max)
    if sort_by == "new":
        new_condition = col(Product.is_new).is_(True)
        statement = statement.where(new_condition)
        count_statement = count_statement.where(new_condition)

    if sort_by == "discount":
        deal_condition = or_(
            col(Product.is_campaign).is_(True),
            col(Product.discount_price).is_not(None),
        )
        statement = statement.where(deal_condition)
        count_statement = count_statement.where(deal_condition)
    if sort_by == 'price_asc':
        order_col = col(Product.price).asc()
    elif sort_by == 'price_desc':
        order_col = col(Product.price).desc()
    else:
        order_col = col(Product.created_at).desc()

    statement = (
        statement.options(
            selectinload(Product.variants),
            selectinload(Product.images),
        )
        .order_by(order_col)
        .offset((page - 1) * page_size)
        .limit(page_size)
    )

    products = list(session.exec(statement).all())
    total = session.exec(count_statement).one()

    return products, total


def get_product_by_id(
    session: Session,
    product_id: int,
) -> Product | None:
    statement = (
        select(Product)
        .where(col(Product.id) == product_id)
        .options(
            selectinload(Product.variants),
            selectinload(Product.images),
        )
    )
    return session.exec(statement).first()


def get_product_by_slug(
    session: Session,
    slug: str,
) -> Product | None:
    statement = select(Product).where(
        col(Product.slug) == slug,
    )
    return session.exec(statement).first()


def get_product_by_sku(
    session: Session,
    sku: str,
) -> Product | None:
    statement = select(Product).where(
        col(Product.sku) == sku,
    )
    return session.exec(statement).first()


def get_product_by_barcode(
    session: Session,
    barcode: str,
) -> Product | None:
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