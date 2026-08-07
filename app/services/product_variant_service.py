from typing import Optional, Union, Any
from datetime import timezone, datetime

from sqlalchemy.exc import IntegrityError
from sqlmodel import Session

from app.core.exceptions import (
    BusinessRuleError,
    ConflictError,
    NotFoundError,
)
from app.models.product import Product, ProductVariant
from app.repositories.product_repository import (
    get_product_by_sku,
)
from app.repositories.product_variant_repository import (
    delete_variant,
    get_product_variants,
    get_variant_by_id_and_product_id,
    get_variant_by_sku,
    save_variant,
)
from app.schemas.product_variant import (
    ProductVariantCreate,
    ProductVariantResponse,
    ProductVariantUpdate,
)


def require_variant_product(
    session: Session,
    product_id: int,
) -> Product:
    product = session.get(Product, product_id)

    if product is None:
        raise NotFoundError("Ürün bulunamadı.")

    if not product.has_variants:
        raise BusinessRuleError(
            "Bu ürün varyantlı olarak işaretlenmemiş."
        )

    return product



def ensure_variant_sku_is_unique(
    session: Session,
    *,
    sku: str,
    current_variant_id: Optional[int] = None,
) -> None:
    product = get_product_by_sku(session, sku)
    variant = get_variant_by_sku(session, sku)

    if product is not None:
        raise ConflictError(
            "Bu SKU bir ana üründe kullanılıyor."
        )

    if (
        variant is not None
        and variant.id != current_variant_id
    ):
        raise ConflictError(
            "Bu varyant SKU değeri zaten kullanılıyor."
        )


def list_product_variants(
    session: Session,
    product_id: int,
) -> list[ProductVariantResponse]:
    require_variant_product(session, product_id)
    variants = get_product_variants(session, product_id)

    return [
        ProductVariantResponse.model_validate(variant)
        for variant in variants
    ]


def create_new_variant(
    session: Session,
    *,
    product_id: int,
    payload: ProductVariantCreate,
) -> ProductVariantResponse:
    require_variant_product(session, product_id)
    sku = payload.sku.strip()

    ensure_variant_sku_is_unique(
        session,
        sku=sku,
    )

    variant = ProductVariant(
        product_id=product_id,
        sku=sku,
        color=payload.color,
        size=payload.size,
        price=payload.price,
        discount_price=payload.discount_price,
        stock=payload.stock,
        min_stock_level=payload.min_stock_level,
        image_path=payload.image_path,
    )
    saved_variant = save_variant(session, variant)

    return ProductVariantResponse.model_validate(
        saved_variant
    )


def update_existing_variant(
    session: Session,
    *,
    product_id: int,
    variant_id: int,
    payload: ProductVariantUpdate,
) -> ProductVariantResponse:
    require_variant_product(session, product_id)
    variant = get_variant_by_id_and_product_id(
        session,
        variant_id=variant_id,
        product_id=product_id,
    )

    if variant is None:
        raise NotFoundError("Ürün varyantı bulunamadı.")

    update_data = payload.model_dump(exclude_unset=True)

    if "sku" in update_data:
        sku = update_data["sku"].strip()
        ensure_variant_sku_is_unique(
            session,
            sku=sku,
            current_variant_id=variant_id,
        )
        update_data["sku"] = sku

    price = update_data.get("price", variant.price)
    discount_price = update_data.get(
        "discount_price",
        variant.discount_price,
    )

    if discount_price is not None and price is None:
        raise BusinessRuleError(
            "İndirimli varyant fiyatı için normal fiyat gereklidir."
        )

    if (
        discount_price is not None
        and price is not None
        and float(discount_price) >= float(price)
    ):
        raise BusinessRuleError(
            "İndirimli fiyat normal fiyattan düşük olmalıdır."
        )

    for field, value in update_data.items():
        setattr(variant, field, value)

    variant.updated_at = datetime.now(timezone.utc)
    saved_variant = save_variant(session, variant)

    return ProductVariantResponse.model_validate(
        saved_variant
    )


def delete_existing_variant(
    session: Session,
    *,
    product_id: int,
    variant_id: int,
) -> None:
    require_variant_product(session, product_id)
    variant = get_variant_by_id_and_product_id(
        session,
        variant_id=variant_id,
        product_id=product_id,
    )

    if variant is None:
        raise NotFoundError("Ürün varyantı bulunamadı.")

    try:
        delete_variant(session, variant)

    except IntegrityError as error:
        session.rollback()
        raise BusinessRuleError(
            "Sipariş veya sepette kullanılan varyant silinemez."
        ) from error