from fastapi import UploadFile
from sqlmodel import Session

from app.core.exceptions import (
    BusinessRuleError,
    NotFoundError,
)
from app.models.product import Product, ProductImage
from app.repositories.product_image_repository import (
    delete_product_image,
    get_image_by_id_and_product_id,
    get_product_images,
    save_product_image,
    save_product_images,
)
from app.schemas.product_image import ProductImageResponse
from app.services.file_storage_service import (
    delete_stored_image,
    save_image,
)

MAX_IMAGES_PER_PRODUCT = 10


def require_product(
    session: Session,
    product_id: int,
) -> Product:
    product = session.get(Product, product_id)

    if product is None:
        raise NotFoundError("Ürün bulunamadı.")

    return product


def list_product_images(
    session: Session,
    product_id: int,
) -> list[ProductImageResponse]:
    require_product(session, product_id)
    images = get_product_images(session, product_id)

    return [
        ProductImageResponse.model_validate(image)
        for image in images
    ]


async def upload_product_image(
    session: Session,
    *,
    product_id: int,
    file: UploadFile,
    is_cover: bool,
    sort_order: int,
) -> ProductImageResponse:
    require_product(session, product_id)
    existing_images = get_product_images(
        session,
        product_id,
    )

    if len(existing_images) >= MAX_IMAGES_PER_PRODUCT:
        raise BusinessRuleError(
            "Bir ürüne en fazla 10 görsel yüklenebilir."
        )

    if not existing_images:
        is_cover = True

    image_path = await save_image(
        file,
        folder="products",
    )

    try:
        if is_cover:
            for existing_image in existing_images:
                existing_image.is_cover = False

            if existing_images:
                save_product_images(
                    session,
                    existing_images,
                )

        product_image = ProductImage(
            product_id=product_id,
            image_path=image_path,
            is_cover=is_cover,
            sort_order=sort_order,
        )
        saved_image = save_product_image(
            session,
            product_image,
        )

    except Exception:
        session.rollback()
        delete_stored_image(image_path)
        raise

    return ProductImageResponse.model_validate(
        saved_image
    )


def delete_existing_product_image(
    session: Session,
    *,
    product_id: int,
    image_id: int,
) -> None:
    require_product(session, product_id)
    image = get_image_by_id_and_product_id(
        session,
        image_id=image_id,
        product_id=product_id,
    )

    if image is None:
        raise NotFoundError("Ürün görseli bulunamadı.")

    was_cover = image.is_cover
    image_path = image.image_path

    delete_product_image(session, image)
    delete_stored_image(image_path)

    if was_cover:
        remaining_images = get_product_images(
            session,
            product_id,
        )

        if remaining_images:
            remaining_images[0].is_cover = True
            save_product_image(
                session,
                remaining_images[0],
            )