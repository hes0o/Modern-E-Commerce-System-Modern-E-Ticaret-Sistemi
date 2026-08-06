from typing import Annotated

from fastapi import APIRouter, Depends, Query, status
from sqlmodel import Session

from app.core.dependencies import require_permission
from app.database import get_session
from app.models.user import User
from app.schemas.common import ApiResponse
from app.schemas.product import (
    ProductCreate,
    ProductListResponse,
    ProductResponse,
    ProductUpdate,
)
from app.services.product_service import (
    archive_product,
    create_new_product,
    get_product,
    list_products,
    update_existing_product,
)

router = APIRouter(
    prefix="/api/products",
    tags=["Products"],
)


def create_product_response(
    product: object,
) -> ProductResponse:
    return ProductResponse.model_validate(product)


@router.get(
    "",
    response_model=ApiResponse[ProductListResponse],
)
def get_product_list(
    session: Annotated[Session, Depends(get_session)],
    page: Annotated[int, Query(ge=1)] = 1,
    page_size: Annotated[int, Query(ge=1, le=100)] = 20,
    search: Annotated[
        str | None,
        Query(min_length=1, max_length=200),
    ] = None,
    category_id: Annotated[
        int | None,
        Query(gt=0),
    ] = None,
) -> ApiResponse[ProductListResponse]:
    result = list_products(
        session,
        page=page,
        page_size=page_size,
        search=search,
        category_id=category_id,
    )

    return ApiResponse(
        success=True,
        data=result,
        message="Ürünler getirildi.",
    )


@router.get(
    "/{product_id}",
    response_model=ApiResponse[ProductResponse],
)
def get_product_detail(
    product_id: int,
    session: Annotated[Session, Depends(get_session)],
) -> ApiResponse[ProductResponse]:
    product = get_product(
        session,
        product_id,
        published_only=True,
    )

    return ApiResponse(
        success=True,
        data=create_product_response(product),
        message="Ürün getirildi.",
    )


@router.post(
    "",
    response_model=ApiResponse[ProductResponse],
    status_code=status.HTTP_201_CREATED,
)
def create_product(
    product_data: ProductCreate,
    session: Annotated[Session, Depends(get_session)],
    _admin_user: Annotated[
    User,
    Depends(require_permission("product.create")),
    ],
) -> ApiResponse[ProductResponse]:
    product = create_new_product(
        session,
        product_data,
    )

    return ApiResponse(
        success=True,
        data=create_product_response(product),
        message="Ürün başarıyla oluşturuldu.",
    )


@router.put(
    "/{product_id}",
    response_model=ApiResponse[ProductResponse],
)
def update_product(
    product_id: int,
    product_data: ProductUpdate,
    session: Annotated[Session, Depends(get_session)],
    _admin_user: Annotated[
    User,
    Depends(require_permission("product.update")),
    ],
) -> ApiResponse[ProductResponse]:
    product = update_existing_product(
        session,
        product_id,
        product_data,
    )

    return ApiResponse(
        success=True,
        data=create_product_response(product),
        message="Ürün başarıyla güncellendi.",
    )


@router.delete(
    "/{product_id}",
    response_model=ApiResponse[ProductResponse],
)
def delete_product(
    product_id: int,
    session: Annotated[Session, Depends(get_session)],
    _admin_user: Annotated[
    User,
    Depends(require_permission("product.delete")),
    ],
) -> ApiResponse[ProductResponse]:
    product = archive_product(
        session,
        product_id,
    )

    return ApiResponse(
        success=True,
        data=create_product_response(product),
        message="Ürün arşivlendi.",
    )