from sqlalchemy import func, or_
from sqlmodel import Session, col, select

from app.models.enums import ProductStatus
from app.models.product import Product, ProductVariant


def get_products(
    session: Session,
    *,
    page: int = 1,
    page_size: int = 20,
    search: str | None = None,
    category_id: int | None = None,
    brand_id: int | None = None,
    color: str | None = None,
    size: str | None = None,
    min_price: float | None = None,
    max_price: float | None = None,
    is_new: bool | None = None,
    is_bestseller: bool | None = None,
    is_featured: bool | None = None,
    is_campaign: bool | None = None,
    sort: str = "newest",
    status: ProductStatus | None = ProductStatus.PUBLISHED,
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

    if brand_id is not None:
        brand_condition = col(Product.brand_id) == brand_id
        statement = statement.where(brand_condition)
        count_statement = count_statement.where(brand_condition)

    variant_filters = []

    if color:
        variant_filters.append(
            col(ProductVariant.color).ilike(color.strip())
        )

    if size:
        variant_filters.append(
            col(ProductVariant.size).ilike(size.strip())
        )

    if variant_filters:
        variant_condition = (
            select(ProductVariant.id)
            .where(
                ProductVariant.product_id == Product.id,
                *variant_filters,
            )
            .exists()
        )
        statement = statement.where(variant_condition)

    effective_price = func.coalesce(
        Product.discount_price,
        Product.price,
    )

    if min_price is not None:
        min_price_condition = effective_price >= min_price
        statement = statement.where(min_price_condition)
        count_statement = count_statement.where(min_price_condition)

    if max_price is not None:
        max_price_condition = effective_price <= max_price
        statement = statement.where(max_price_condition)
        count_statement = count_statement.where(max_price_condition)

    boolean_filters = (
        (Product.is_new, is_new),
        (Product.is_bestseller, is_bestseller),
        (Product.is_featured, is_featured),
        (Product.is_campaign, is_campaign),
    )

    for field, value in boolean_filters:
        if value is not None:
            condition = col(field) == value
            statement = statement.where(condition)
            count_statement = count_statement.where(condition)

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

    if sort == "price_asc":
        statement = statement.order_by(
            effective_price.asc(),
            col(Product.id).desc(),
        )
    elif sort == "price_desc":
        statement = statement.order_by(
            effective_price.desc(),
            col(Product.id).desc(),
        )
    elif sort == "name_asc":
        statement = statement.order_by(
            col(Product.name).asc(),
            col(Product.id).desc(),
        )
    else:
        statement = statement.order_by(
            col(Product.created_at).desc(),
            col(Product.id).desc(),
        )

    statement = statement.offset(
        (page - 1) * page_size
    ).limit(page_size)

    products = list(session.exec(statement).all())
    total = session.exec(count_statement).one()

    return products, total


def get_product_by_id(
    session: Session,
    product_id: int,
) -> Product | None:
    return session.get(Product, product_id)


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