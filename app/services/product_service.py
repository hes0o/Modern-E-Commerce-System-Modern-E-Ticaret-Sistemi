from sqlmodel import Session

from app.core.exceptions import (
    BusinessRuleError,
    ConflictError,
    NotFoundError,
)
from app.core.html_sanitizer import sanitize_html
from app.models.brand import Brand
from app.models.enums import ProductStatus
from app.models.product import Product
from app.repositories.category_repository import (
    get_category_by_id,
)
from app.repositories.product_repository import (
    create_product as save_new_product,
)
from app.repositories.product_repository import (
    get_product_by_barcode,
    get_product_by_id,
    get_product_by_sku,
    get_product_by_slug,
    get_products,
)
from app.repositories.product_repository import (
    update_product as save_product,
)
from app.schemas.product import (
    ProductCreate,
    ProductListResponse,
    ProductResponse,
    ProductUpdate,
)
from app.services.audit_service import log_price_change
from app.services.category_service import create_slug


def validate_category(
    session: Session,
    category_id: int,
) -> None:
    category = get_category_by_id(session, category_id)

    if category is None:
        raise NotFoundError("Ürün kategorisi bulunamadı.")

    if not category.is_active:
        raise BusinessRuleError(
            "Pasif bir kategoriye ürün eklenemez."
        )


def validate_brand(
    session: Session,
    brand_id: int | None,
) -> None:
    if brand_id is None:
        return

    brand = session.get(Brand, brand_id)

    if brand is None:
        raise NotFoundError("Marka bulunamadı.")

    if not brand.is_active:
        raise BusinessRuleError(
            "Pasif bir marka ürüne atanamaz."
        )


def ensure_product_fields_are_unique(
    session: Session,
    *,
    sku: str,
    slug: str,
    barcode: str | None,
    current_product_id: int | None = None,
) -> None:
    product_with_sku = get_product_by_sku(session, sku)

    if (
        product_with_sku is not None
        and product_with_sku.id != current_product_id
    ):
        raise ConflictError(
            "Bu ürün kodu zaten kullanılıyor."
        )

    product_with_slug = get_product_by_slug(session, slug)

    if (
        product_with_slug is not None
        and product_with_slug.id != current_product_id
    ):
        raise ConflictError(
            "Bu ürün bağlantı adı zaten kullanılıyor."
        )

    if barcode is None:
        return

    product_with_barcode = get_product_by_barcode(
        session,
        barcode,
    )

    if (
        product_with_barcode is not None
        and product_with_barcode.id != current_product_id
    ):
        raise ConflictError(
            "Bu barkod zaten kullanılıyor."
        )


def validate_price_rules(
    price: float,
    discount_price: float | None,
) -> None:
    if (
        discount_price is not None
        and discount_price >= price
    ):
        raise BusinessRuleError(
            "İndirimli fiyat normal fiyattan düşük olmalıdır."
        )


def validate_stock_rules(
    *,
    has_variants: bool,
    stock: int | None,
) -> None:
    if has_variants and stock is not None:
        raise BusinessRuleError(
            "Varyantlı ürünlerde ana ürün stoku boş olmalıdır."
        )

    if not has_variants and stock is None:
        raise BusinessRuleError(
            "Varyantsız ürünlerde stok bilgisi zorunludur."
        )


def list_products(
    session: Session,
    *,
    page: int,
    page_size: int,
    search: str | None,
    category_id: int | None,
    brand_id: int | None,
    min_price: float | None,
    max_price: float | None,
    is_new: bool | None,
    is_bestseller: bool | None,
    is_featured: bool | None,
    is_campaign: bool | None,
    sort: str,
) -> ProductListResponse:
    if (
        min_price is not None
        and max_price is not None
        and min_price > max_price
    ):
        raise BusinessRuleError(
            "Minimum fiyat, maksimum fiyattan büyük olamaz."
        )
    products, total = get_products(
        session,
        page=page,
        page_size=page_size,
        search=search,
        category_id=category_id,
        brand_id=brand_id,
        min_price=min_price,
        max_price=max_price,
        is_new=is_new,
        is_bestseller=is_bestseller,
        is_featured=is_featured,
        is_campaign=is_campaign,
        sort=sort,
        status=ProductStatus.PUBLISHED,
    )

    total_pages = (
        (total + page_size - 1) // page_size
        if total > 0
        else 0
    )

    return ProductListResponse(
        items=[
            ProductResponse.model_validate(product)
            for product in products
        ],
        total=total,
        page=page,
        page_size=page_size,
        total_pages=total_pages,
    )

def get_product(
    session: Session,
    product_id: int,
    *,
    published_only: bool = False,
) -> Product:
    product = get_product_by_id(session, product_id)

    if product is None:
        raise NotFoundError("Ürün bulunamadı.")

    if (
        published_only
        and product.status != ProductStatus.PUBLISHED
    ):
        raise NotFoundError("Ürün bulunamadı.")

    return product

def get_product_by_slug_detail(
    session: Session,
    slug: str,
) -> Product:
    product = get_product_by_slug(
        session,
        slug.strip().lower(),
    )

    if (
        product is None
        or product.status != ProductStatus.PUBLISHED
    ):
        raise NotFoundError("Ürün bulunamadı.")

    return product

def create_new_product(
    session: Session,
    product_data: ProductCreate,
) -> Product:
    validate_category(
        session,
        product_data.category_id,
    )
    validate_brand(
        session,
        product_data.brand_id,
    )
    validate_price_rules(
        product_data.price,
        product_data.discount_price,
    )
    validate_stock_rules(
        has_variants=product_data.has_variants,
        stock=product_data.stock,
    )

    slug = create_slug(
        product_data.slug or product_data.name,
    )

    if not slug:
        raise BusinessRuleError(
            "Geçerli bir ürün bağlantı adı oluşturulamadı."
        )

    sku = product_data.sku.strip().upper()
    barcode = (
        product_data.barcode.strip()
        if product_data.barcode
        else None
    )

    ensure_product_fields_are_unique(
        session,
        sku=sku,
        slug=slug,
        barcode=barcode,
    )

    product = Product(
        category_id=product_data.category_id,
        brand_id=product_data.brand_id,
        sku=sku,
        barcode=barcode,
        name=product_data.name.strip(),
        slug=slug,
        short_description=(
            product_data.short_description.strip()
        ),
        long_description=sanitize_html(
            product_data.long_description
        ),
        seo_title=product_data.seo_title,
        seo_description=product_data.seo_description,
        price=product_data.price,
        discount_price=product_data.discount_price,
        vat_rate=product_data.vat_rate,
        status=product_data.status,
        has_variants=product_data.has_variants,
        stock=product_data.stock,
        min_stock_level=product_data.min_stock_level,
        is_new=product_data.is_new,
        is_bestseller=product_data.is_bestseller,
        is_featured=product_data.is_featured,
        is_campaign=product_data.is_campaign,
    )

    return save_new_product(session, product)


def update_existing_product(
    session: Session,
    product_id: int,
    product_data: ProductUpdate,
    *,
    changed_by_user_id: int | None = None,
) -> Product:
    product = get_product(session, product_id)
    old_price = float(product.price)
    old_discount = (
        float(product.discount_price)
        if product.discount_price is not None
        else None
    )
    update_data = product_data.model_dump(
        exclude_unset=True,
    )

    if "category_id" in update_data:
        validate_category(
            session,
            update_data["category_id"],
        )

    if "brand_id" in update_data:
        validate_brand(
            session,
            update_data["brand_id"],
        )

    if "slug" in update_data:
        requested_slug = update_data["slug"]

        if requested_slug is None:
            update_data.pop("slug")
        else:
            slug = create_slug(requested_slug)

            if not slug:
                raise BusinessRuleError(
                    "Geçerli bir ürün bağlantı adı oluşturulamadı."
                )

            update_data["slug"] = slug

    if "sku" in update_data:
        update_data["sku"] = (
            update_data["sku"].strip().upper()
        )

    if "barcode" in update_data:
        barcode = update_data["barcode"]
        update_data["barcode"] = (
            barcode.strip() if barcode else None
        )

    if "name" in update_data:
        update_data["name"] = (
            update_data["name"].strip()
        )

    if "short_description" in update_data:
        update_data["short_description"] = (
            update_data["short_description"].strip()
        )

    if "long_description" in update_data:
        update_data["long_description"] = sanitize_html(
            update_data["long_description"]
        )

    if (
        update_data.get("has_variants") is True
        and "stock" not in update_data
    ):
        update_data["stock"] = None

    if (
        update_data.get("has_variants") is False
        and "stock" not in update_data
        and product.stock is None
    ):
        update_data["stock"] = 0

    new_price = update_data.get(
        "price",
        product.price,
    )
    new_discount_price = update_data.get(
        "discount_price",
        product.discount_price,
    )
    new_has_variants = update_data.get(
        "has_variants",
        product.has_variants,
    )
    new_stock = update_data.get(
        "stock",
        product.stock,
    )

    validate_price_rules(
        float(new_price),
        (
            float(new_discount_price)
            if new_discount_price is not None
            else None
        ),
    )
    validate_stock_rules(
        has_variants=new_has_variants,
        stock=new_stock,
    )

    new_sku = update_data.get(
        "sku",
        product.sku,
    )
    new_slug = update_data.get(
        "slug",
        product.slug,
    )
    new_barcode = update_data.get(
        "barcode",
        product.barcode,
    )

    ensure_product_fields_are_unique(
        session,
        sku=new_sku,
        slug=new_slug,
        barcode=new_barcode,
        current_product_id=product_id,
    )

    for field_name, value in update_data.items():
        setattr(product, field_name, value)

    new_price_value = float(product.price)
    new_discount_value = (
        float(product.discount_price)
        if product.discount_price is not None
        else None
    )

    if changed_by_user_id is not None and (
        old_price != new_price_value
        or old_discount != new_discount_value
    ):
        log_price_change(
            session,
            product_id=product.id,
            old_price=old_price,
            new_price=new_price_value,
            old_discount=old_discount,
            new_discount=new_discount_value,
            user_id=changed_by_user_id,
        )

    return save_product(session, product)


def archive_product(
    session: Session,
    product_id: int,
) -> Product:
    product = get_product(session, product_id)
    product.status = ProductStatus.ARCHIVED
    return save_product(session, product)