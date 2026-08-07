from datetime import timezone, datetime

from sqlmodel import Session

from app.core.exceptions import ConflictError, NotFoundError
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


def list_brands(
    session: Session,
    *,
    include_inactive: bool = False,
) -> list[BrandResponse]:
    brands = get_brands(
        session,
        include_inactive=include_inactive,
    )
    return [
        BrandResponse.model_validate(brand)
        for brand in brands
    ]


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

    brand = Brand(
        name=name,
        logo_path=payload.logo_path,
        is_active=payload.is_active,
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

    for field, value in update_data.items():
        setattr(brand, field, value)

    brand.updated_at = datetime.now(timezone.utc)
    saved_brand = save_brand(session, brand)

    return BrandResponse.model_validate(saved_brand)


def deactivate_brand(
    session: Session,
    brand_id: int,
) -> BrandResponse:
    brand = get_brand_by_id(session, brand_id)

    if brand is None:
        raise NotFoundError("Marka bulunamadı.")

    brand.is_active = False
    brand.updated_at = datetime.now(timezone.utc)
    saved_brand = save_brand(session, brand)

    return BrandResponse.model_validate(saved_brand)