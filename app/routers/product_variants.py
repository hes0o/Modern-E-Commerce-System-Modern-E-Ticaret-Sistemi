from typing import Annotated

from fastapi import APIRouter, Depends, status
from sqlmodel import Session

from app.core.dependencies import require_permission
from app.database import get_session
from app.models.user import User
from app.schemas.common import ApiResponse
from app.schemas.product_variant import (
    ProductVariantCreate,
    ProductVariantResponse,
    ProductVariantUpdate,
)
from app.services.product_variant_service import (
    create_new_variant,
    delete_existing_variant,
    list_product_variants,
    update_existing_variant,
)

router = APIRouter(
    prefix="/api/products/{product_id}/variants",
    tags=["Product Variants"],
)


@router.get(
    "",
    response_model=ApiResponse[list[ProductVariantResponse]],
)
def variant_list(
    product_id: int,
    session: Annotated[Session, Depends(get_session)],
) -> ApiResponse[list[ProductVariantResponse]]:
    variants = list_product_variants(
        session,
        product_id,
    )

    return ApiResponse(
        success=True,
        data=variants,
        message="Ürün varyantları getirildi.",
    )


@router.post(
    "",
    response_model=ApiResponse[ProductVariantResponse],
    status_code=status.HTTP_201_CREATED,
)
def create_variant(
    product_id: int,
    payload: ProductVariantCreate,
    session: Annotated[Session, Depends(get_session)],
    _admin: Annotated[User, Depends(require_permission("product.update"))],
) -> ApiResponse[ProductVariantResponse]:
    variant = create_new_variant(
        session,
        product_id=product_id,
        payload=payload,
    )

    return ApiResponse(
        success=True,
        data=variant,
        message="Ürün varyantı oluşturuldu.",
    )


@router.patch(
    "/{variant_id}",
    response_model=ApiResponse[ProductVariantResponse],
)
def update_variant(
    product_id: int,
    variant_id: int,
    payload: ProductVariantUpdate,
    session: Annotated[Session, Depends(get_session)],
    _admin: Annotated[User, Depends(require_permission("product.update"))],
) -> ApiResponse[ProductVariantResponse]:
    variant = update_existing_variant(
        session,
        product_id=product_id,
        variant_id=variant_id,
        payload=payload,
    )

    return ApiResponse(
        success=True,
        data=variant,
        message="Ürün varyantı güncellendi.",
    )


@router.delete(
    "/{variant_id}",
    response_model=ApiResponse[None],
)
def delete_variant(
    product_id: int,
    variant_id: int,
    session: Annotated[Session, Depends(get_session)],
    _admin: Annotated[User, Depends(require_permission("product.delete"))],
) -> ApiResponse[None]:
    delete_existing_variant(
        session,
        product_id=product_id,
        variant_id=variant_id,
    )

    return ApiResponse(
        success=True,
        data=None,
        message="Ürün varyantı silindi.",
    )