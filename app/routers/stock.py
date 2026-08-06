from typing import Annotated

from fastapi import APIRouter, Depends, Query
from sqlmodel import Session

from app.core.dependencies import require_admin
from app.database import get_session
from app.models.enums import StockMovementType
from app.models.user import User
from app.schemas.common import ApiResponse
from app.schemas.stock import (
    StockMovementListResponse,
    StockMovementResponse,
    StockUpdateRequest,
)
from app.services.stock_api_service import (
    list_stock_movements,
    update_stock,
)

router = APIRouter(
    prefix="/api/admin/stock",
    tags=["Stock Management"],
)


@router.patch(
    "/products/{product_id}",
    response_model=ApiResponse[StockMovementResponse],
)
def change_product_stock(
    product_id: int,
    payload: StockUpdateRequest,
    session: Annotated[Session, Depends(get_session)],
    admin: Annotated[User, Depends(require_admin)],
) -> ApiResponse[StockMovementResponse]:
    movement = update_stock(
        session,
        product_id=product_id,
        user_id=admin.id,
        payload=payload,
    )

    return ApiResponse(
        success=True,
        data=movement,
        message="Stok başarıyla güncellendi.",
    )


@router.get(
    "/movements",
    response_model=ApiResponse[StockMovementListResponse],
)
def stock_movement_list(
    session: Annotated[Session, Depends(get_session)],
    _admin: Annotated[User, Depends(require_admin)],
    page: Annotated[int, Query(ge=1)] = 1,
    page_size: Annotated[int, Query(ge=1, le=100)] = 20,
    product_id: int | None = None,
    variant_id: int | None = None,
    movement_type: StockMovementType | None = None,
) -> ApiResponse[StockMovementListResponse]:
    movements = list_stock_movements(
        session,
        page=page,
        page_size=page_size,
        product_id=product_id,
        variant_id=variant_id,
        movement_type=movement_type,
    )

    return ApiResponse(
        success=True,
        data=movements,
        message="Stok hareketleri getirildi.",
    )