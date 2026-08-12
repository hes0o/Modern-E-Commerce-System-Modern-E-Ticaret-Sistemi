from typing import Annotated

from fastapi import APIRouter, Depends, status
from sqlmodel import Session

from app.core.dependencies import require_permission
from app.database import get_session
from app.models.user import User
from app.schemas.brand import (
    BrandCreate,
    BrandResponse,
    BrandUpdate,
)
from app.schemas.common import ApiResponse
from app.services.brand_service import (
    create_new_brand,
    delete_brand_permanently,
    get_brand,
    list_brands,
    update_existing_brand,
)

router = APIRouter(
    prefix="/api/brands",
    tags=["Brands"],
)


@router.get(
    "",
    response_model=ApiResponse[list[BrandResponse]],
)
def public_brand_list(
    session: Annotated[Session, Depends(get_session)],
    category_id: int | None = None,
) -> ApiResponse[list[BrandResponse]]:
    brands = list_brands(session, category_id=category_id)

    return ApiResponse(
        success=True,
        data=brands,
        message="Markalar getirildi.",
    )


@router.get(
    "/admin",
    response_model=ApiResponse[list[BrandResponse]],
)
def admin_brand_list(
    session: Annotated[Session, Depends(get_session)],
    _admin: Annotated[
    User,
    Depends(require_permission("brand.read")),
    ],
    category_id: int | None = None,
) -> ApiResponse[list[BrandResponse]]:
    brands = list_brands(
        session,
        include_inactive=True,
        category_id=category_id,
    )

    return ApiResponse(
        success=True,
        data=brands,
        message="Markalar getirildi.",
    )


@router.get(
    "/admin/{brand_id}",
    response_model=ApiResponse[BrandResponse],
)
def admin_brand_detail(
    brand_id: int,
    session: Annotated[Session, Depends(get_session)],
    _admin: Annotated[
    User,
    Depends(require_permission("brand.read")),
    ],
) -> ApiResponse[BrandResponse]:
    brand = get_brand(session, brand_id)

    return ApiResponse(
        success=True,
        data=brand,
        message="Marka getirildi.",
    )


@router.post(
    "",
    response_model=ApiResponse[BrandResponse],
    status_code=status.HTTP_201_CREATED,
)
def create_brand(
    payload: BrandCreate,
    session: Annotated[Session, Depends(get_session)],
    _admin: Annotated[
    User,
    Depends(require_permission("brand.create")),
    ],
) -> ApiResponse[BrandResponse]:
    brand = create_new_brand(session, payload)

    return ApiResponse(
        success=True,
        data=brand,
        message="Marka başarıyla oluşturuldu.",
    )


@router.patch(
    "/{brand_id}",
    response_model=ApiResponse[BrandResponse],
)
def update_brand(
    brand_id: int,
    payload: BrandUpdate,
    session: Annotated[Session, Depends(get_session)],
    _admin: Annotated[
    User,
    Depends(require_permission("brand.update")),
    ],
) -> ApiResponse[BrandResponse]:
    brand = update_existing_brand(
        session,
        brand_id=brand_id,
        payload=payload,
    )

    return ApiResponse(
        success=True,
        data=brand,
        message="Marka başarıyla güncellendi.",
    )


@router.delete(
    "/{brand_id}",
    response_model=ApiResponse[BrandResponse],
)
def delete_brand(
    brand_id: int,
    session: Annotated[Session, Depends(get_session)],
    _admin: Annotated[
    User,
    Depends(require_permission("brand.delete")),
    ],
) -> ApiResponse[BrandResponse]:
    brand = delete_brand_permanently(session, brand_id)

    return ApiResponse(
        success=True,
        data=brand,
        message="Marka başarıyla silindi.",
    )