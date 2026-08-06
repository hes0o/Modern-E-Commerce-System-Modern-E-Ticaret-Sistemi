from typing import Annotated

from fastapi import (
    APIRouter,
    Depends,
    File,
    Form,
    UploadFile,
    status,
)
from sqlmodel import Session

from app.core.dependencies import require_permission
from app.database import get_session
from app.models.user import User
from app.schemas.common import ApiResponse
from app.schemas.product_image import ProductImageResponse
from app.services.product_image_service import (
    delete_existing_product_image,
    list_product_images,
    upload_product_image,
)

router = APIRouter(
    prefix="/api/products/{product_id}/images",
    tags=["Product Images"],
)


@router.get(
    "",
    response_model=ApiResponse[list[ProductImageResponse]],
)
def product_image_list(
    product_id: int,
    session: Annotated[Session, Depends(get_session)],
) -> ApiResponse[list[ProductImageResponse]]:
    images = list_product_images(
        session,
        product_id,
    )

    return ApiResponse(
        success=True,
        data=images,
        message="Ürün görselleri getirildi.",
    )


@router.post(
    "",
    response_model=ApiResponse[ProductImageResponse],
    status_code=status.HTTP_201_CREATED,
)
async def create_product_image(
    product_id: int,
    file: Annotated[UploadFile, File()],
    session: Annotated[Session, Depends(get_session)],
    _admin: Annotated[User, Depends(require_permission("product.update"))],
    is_cover: Annotated[bool, Form()] = False,
    sort_order: Annotated[int, Form(ge=0)] = 0,
) -> ApiResponse[ProductImageResponse]:
    image = await upload_product_image(
        session,
        product_id=product_id,
        file=file,
        is_cover=is_cover,
        sort_order=sort_order,
    )

    return ApiResponse(
        success=True,
        data=image,
        message="Ürün görseli yüklendi.",
    )


@router.delete(
    "/{image_id}",
    response_model=ApiResponse[None],
)
def delete_product_image(
    product_id: int,
    image_id: int,
    session: Annotated[Session, Depends(get_session)],
    _admin: Annotated[User, Depends(require_permission("product.update"))],
) -> ApiResponse[None]:
    delete_existing_product_image(
        session,
        product_id=product_id,
        image_id=image_id,
    )

    return ApiResponse(
        success=True,
        data=None,
        message="Ürün görseli silindi.",
    )