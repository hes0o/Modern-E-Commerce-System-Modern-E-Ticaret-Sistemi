from typing import Optional
from datetime import timezone, datetime

from sqlmodel import Session, select

from app.core.exceptions import ConflictError, NotFoundError, BusinessRuleError
from app.models.brand import Brand
from app.repositories.brand_repository import (
    get_brand_by_id,
    get_brand_by_name,
    get_brands,
    save_brand,
)
from app.schemas.brand import (
    BrandCreate,
    BrandResponse,
    BrandUpdate,
)
from app.repositories.category_repository import get_category_by_id


def list_brands(
    session: Session,
    *,
    include_inactive: bool = False,
    category_id: Optional[int] = None,
) -> list[dict]:
    from sqlalchemy import func
    from app.models.product import Product

    brands = get_brands(
        session,
        include_inactive=include_inactive,
        category_id=category_id,
    )
    result = []
    for b in brands:
        cnt = session.exec(
            select(func.count(Product.id)).where(Product.brand_id == b.id)
        ).one()
        b_dict = BrandResponse.model_validate(b).model_dump()
        b_dict["product_count"] = cnt
        b_dict["slug"] = b.name.lower().replace(" ", "-")
        result.append(b_dict)
    return result


def get_brand(
    session: Session,
    brand_id: int,
) -> BrandResponse:
    brand = get_brand_by_id(session, brand_id)

    if brand is None:
        raise NotFoundError("Marka bulunamadı.")

    return BrandResponse.model_validate(brand)


def create_new_brand(
    session: Session,
    payload: BrandCreate,
) -> BrandResponse:
    name = payload.name.strip()
    existing_brand = get_brand_by_name(session, name)

    if existing_brand is not None:
        raise ConflictError("Bu marka adı zaten kullanılıyor.")

    category = get_category_by_id(session, payload.category_id)
    if category is None:
        raise NotFoundError("Belirtilen kategori bulunamadı.")

    brand = Brand(
        name=name,
        logo_path=payload.logo_path,
        is_active=payload.is_active,
        category_id=payload.category_id,
    )
    saved_brand = save_brand(session, brand)

    return BrandResponse.model_validate(saved_brand)


def update_existing_brand(
    session: Session,
    *,
    brand_id: int,
    payload: BrandUpdate,
) -> BrandResponse:
    brand = get_brand_by_id(session, brand_id)

    if brand is None:
        raise NotFoundError("Marka bulunamadı.")

    update_data = payload.model_dump(exclude_unset=True)

    if "name" in update_data:
        name = update_data["name"].strip()
        existing_brand = get_brand_by_name(session, name)

        if (
            existing_brand is not None
            and existing_brand.id != brand_id
        ):
            raise ConflictError(
                "Bu marka adı zaten kullanılıyor."
            )

        update_data["name"] = name
        
    if "category_id" in update_data and update_data["category_id"] is not None:
        category = get_category_by_id(session, update_data["category_id"])
        if category is None:
            raise NotFoundError("Belirtilen kategori bulunamadı.")

    for field, value in update_data.items():
        setattr(brand, field, value)

    brand.updated_at = datetime.now(timezone.utc)
    saved_brand = save_brand(session, brand)

    return BrandResponse.model_validate(saved_brand)


def delete_brand_permanently(
    session: Session,
    brand_id: int,
) -> BrandResponse:
    from sqlalchemy import func
    from app.models.product import Product

    brand = get_brand_by_id(session, brand_id)

    if brand is None:
        raise NotFoundError("Marka bulunamadı.")

    # Check for linked products
    linked_products = session.exec(
        select(func.count()).select_from(Product).where(Product.brand_id == brand_id)
    ).one()
    if linked_products > 0:
        raise BusinessRuleError("Bu markaya ait ürünler olduğu için silinemez. Lütfen önce ürünleri silin.")

    brand_resp = BrandResponse.model_validate(brand)
    session.delete(brand)
    session.commit()

    return brand_resp