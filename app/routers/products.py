from typing import Annotated

from fastapi import APIRouter, Depends, Query, status
from sqlmodel import Session

from app.core.dependencies import require_permission
from app.database import get_session
from app.models.enums import ProductStatus
from app.models.user import User
from app.schemas.common import ApiResponse
from app.schemas.product import (
    ProductCreate,
    ProductDetailResponse,
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
    detail: bool = False,
) -> ProductResponse | ProductDetailResponse:
    prod_dict = product.model_dump()
    images = sorted(
        getattr(product, "images", []),
        key=lambda image: (
            not image.is_cover,
            image.sort_order,
            image.id,
        ),
    )
    prod_dict["images"] = [
        image.model_dump()
        for image in images
    ]
    if getattr(product, "has_variants", False):
        variants = getattr(product, "variants", [])
        prod_dict["stock"] = sum(v.stock for v in variants if getattr(v, "stock", None) is not None)
    
    if detail:
        # Include variants for detail response
        if getattr(product, "has_variants", False):
            prod_dict["variants"] = [v.model_dump() for v in getattr(product, "variants", [])]
        else:
            prod_dict["variants"] = []
        return ProductDetailResponse.model_validate(prod_dict)
    
    return ProductResponse.model_validate(prod_dict)


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
    brand_id: Annotated[
        int | None,
        Query(gt=0),
    ] = None,
    price_min: Annotated[
        float | None,
        Query(ge=0),
    ] = None,
    price_max: Annotated[
        float | None,
        Query(ge=0),
    ] = None,
    sort_by: Annotated[
        str | None,
        Query(),
    ] = None,
    status: Annotated[
        str | None,
        Query(),
    ] = None,
) -> ApiResponse[ProductListResponse]:
    result = list_products(
        session,
        page=page,
        page_size=page_size,
        search=search,
        category_id=category_id,
        status=ProductStatus.PUBLISHED,
        brand_id=brand_id,
        price_min=price_min,
        price_max=price_max,
        sort_by=sort_by,
    )

    return ApiResponse(
        success=True,
        data=result,
        message="Ürünler getirildi.",
    )

@router.get(
    "/admin",
    response_model=ApiResponse[ProductListResponse],
)
def get_admin_product_list(
    session: Annotated[Session, Depends(get_session)],
    _admin_user: Annotated[
        User,
        Depends(require_permission("product.read")),
    ],
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
    brand_id: Annotated[
        int | None,
        Query(gt=0),
    ] = None,
    price_min: Annotated[
        float | None,
        Query(ge=0),
    ] = None,
    price_max: Annotated[
        float | None,
        Query(ge=0),
    ] = None,
    sort_by: Annotated[
        str | None,
        Query(),
    ] = None,
    product_status: Annotated[
        ProductStatus | None,
        Query(alias="status"),
    ] = None,
) -> ApiResponse[ProductListResponse]:
    result = list_products(
        session,
        page=page,
        page_size=page_size,
        search=search,
        category_id=category_id,
        status=product_status,
        brand_id=brand_id,
        price_min=price_min,
        price_max=price_max,
        sort_by=sort_by,
    )

    return ApiResponse(
        success=True,
        data=result,
        message="Ürünler getirildi.",
    )


@router.get(
    "/admin/{product_id}",
    response_model=ApiResponse[ProductDetailResponse],
)
def get_admin_product_detail(
    product_id: int,
    session: Annotated[Session, Depends(get_session)],
    _admin_user: Annotated[
        User,
        Depends(require_permission("product.read")),
    ],
) -> ApiResponse[ProductDetailResponse]:
    product = get_product(
        session,
        product_id,
        published_only=False,
    )

    return ApiResponse(
        success=True,
        data=create_product_response(product, detail=True),
        message="Ürün getirildi.",
    )



@router.get(
    "/{product_id}",
    response_model=ApiResponse[ProductDetailResponse],
)
def get_product_detail(
    product_id: int,
    session: Annotated[Session, Depends(get_session)],
) -> ApiResponse[ProductDetailResponse]:
    product = get_product(
        session,
        product_id,
        published_only=True,
    )

    return ApiResponse(
        success=True,
        data=create_product_response(product, detail=True),
        message="Ürün getirildi.",
    )


@router.post(
    "",
    response_model=ApiResponse[ProductDetailResponse],
    status_code=status.HTTP_201_CREATED,
)
def create_product(
    product_data: ProductCreate,
    session: Annotated[Session, Depends(get_session)],
    _admin_user: Annotated[
    User,
    Depends(require_permission("product.create")),
    ],
) -> ApiResponse[ProductDetailResponse]:
    product = create_new_product(
        session,
        product_data,
    )

    return ApiResponse(
        success=True,
        data=create_product_response(product, detail=True),
        message="Ürün başarıyla oluşturuldu.",
    )


@router.put(
    "/{product_id}",
    response_model=ApiResponse[ProductDetailResponse],
)
def update_product(
    product_id: int,
    product_data: ProductUpdate,
    session: Annotated[Session, Depends(get_session)],
    _admin_user: Annotated[
    User,
    Depends(require_permission("product.update")),
    ],
) -> ApiResponse[ProductDetailResponse]:
    product = update_existing_product(
        session,
        product_id,
        product_data,
    )

    return ApiResponse(
        success=True,
        data=create_product_response(product, detail=True),
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
        message="Ürün başarıyla arşivlendi.",
    )