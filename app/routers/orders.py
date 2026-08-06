from typing import Annotated

from fastapi import APIRouter, Depends, Header, Query, status
from sqlmodel import Session

from app.core.dependencies import (
    get_current_user,
    get_optional_current_user,
    require_permission,
)
from app.database import get_session
from app.models.enums import OrderStatus
from app.models.user import User
from app.schemas.common import ApiResponse
from app.schemas.order import (
    OrderAdminUpdate,
    OrderCancel,
    OrderCreate,
    OrderListResponse,
    OrderResponse,
    OrderStatusUpdate,
)
from app.services.order_api_service import (
    cancel_my_order,
    change_order_status,
    create_checkout_order,
    get_admin_order,
    get_my_order,
    list_admin_orders,
    list_my_orders,
    update_order_admin_details,
)

router = APIRouter(
    prefix="/api/orders",
    tags=["Orders"],
)


@router.post(
    "",
    response_model=ApiResponse[OrderResponse],
    status_code=status.HTTP_201_CREATED,
)
def checkout(
    payload: OrderCreate,
    session: Annotated[Session, Depends(get_session)],
    current_user: Annotated[
        User | None,
        Depends(get_optional_current_user),
    ],
    cart_token: Annotated[
        str | None,
        Header(alias="X-Cart-Token"),
    ] = None,
) -> ApiResponse[OrderResponse]:
    order = create_checkout_order(
        session,
        payload=payload,
        current_user=current_user,
        session_token=cart_token,
    )

    return ApiResponse(
        success=True,
        data=order,
        message="Sipariş başarıyla oluşturuldu.",
    )


@router.get(
    "/me",
    response_model=ApiResponse[OrderListResponse],
)
def my_orders(
    session: Annotated[Session, Depends(get_session)],
    current_user: Annotated[User, Depends(get_current_user)],
    page: Annotated[int, Query(ge=1)] = 1,
    page_size: Annotated[int, Query(ge=1, le=100)] = 20,
) -> ApiResponse[OrderListResponse]:
    orders = list_my_orders(
        session,
        user_id=current_user.id,
        page=page,
        page_size=page_size,
    )

    return ApiResponse(
        success=True,
        data=orders,
        message="Siparişler getirildi.",
    )


@router.get(
    "/me/{order_id}",
    response_model=ApiResponse[OrderResponse],
)
def my_order_detail(
    order_id: int,
    session: Annotated[Session, Depends(get_session)],
    current_user: Annotated[User, Depends(get_current_user)],
) -> ApiResponse[OrderResponse]:
    order = get_my_order(
        session,
        order_id=order_id,
        user_id=current_user.id,
    )

    return ApiResponse(
        success=True,
        data=order,
        message="Sipariş getirildi.",
    )


@router.post(
    "/me/{order_id}/cancel",
    response_model=ApiResponse[OrderResponse],
)
def cancel_customer_order(
    order_id: int,
    payload: OrderCancel,
    session: Annotated[Session, Depends(get_session)],
    current_user: Annotated[User, Depends(get_current_user)],
) -> ApiResponse[OrderResponse]:
    order = cancel_my_order(
        session,
        order_id=order_id,
        user_id=current_user.id,
        note=payload.note,
    )

    return ApiResponse(
        success=True,
        data=order,
        message="Sipariş iptal edildi.",
    )


@router.get(
    "/admin",
    response_model=ApiResponse[OrderListResponse],
)
def admin_orders(
    session: Annotated[Session, Depends(get_session)],
    _admin: Annotated[
    User,
    Depends(require_permission("order.read")),
    ],
    page: Annotated[int, Query(ge=1)] = 1,
    page_size: Annotated[int, Query(ge=1, le=100)] = 20,
    order_status: OrderStatus | None = None,
) -> ApiResponse[OrderListResponse]:
    orders = list_admin_orders(
        session,
        page=page,
        page_size=page_size,
        order_status=order_status,
    )

    return ApiResponse(
        success=True,
        data=orders,
        message="Siparişler getirildi.",
    )


@router.get(
    "/admin/{order_id}",
    response_model=ApiResponse[OrderResponse],
)
def admin_order_detail(
    order_id: int,
    session: Annotated[Session, Depends(get_session)],
    _admin: Annotated[
    User,
    Depends(require_permission("order.read")),
    ],
) -> ApiResponse[OrderResponse]:
    order = get_admin_order(
        session,
        order_id=order_id,
    )

    return ApiResponse(
        success=True,
        data=order,
        message="Sipariş getirildi.",
    )


@router.patch(
    "/admin/{order_id}/status",
    response_model=ApiResponse[OrderResponse],
)
def update_admin_order_status(
    order_id: int,
    payload: OrderStatusUpdate,
    session: Annotated[Session, Depends(get_session)],
    admin: Annotated[
    User,
    Depends(require_permission("order.update_status")),
    ],
) -> ApiResponse[OrderResponse]:
    order = change_order_status(
        session,
        order_id=order_id,
        new_status=payload.status,
        changed_by_user_id=admin.id,
        note=payload.note,
    )

    return ApiResponse(
        success=True,
        data=order,
        message="Sipariş durumu güncellendi.",
    )

@router.patch(
    "/admin/{order_id}",
    response_model=ApiResponse[OrderResponse],
)
def update_admin_order_details(
    order_id: int,
    payload: OrderAdminUpdate,
    session: Annotated[Session, Depends(get_session)],
    _admin: Annotated[
    User,
    Depends(
        require_permission(
            "order.add_note",
            "order.update_tracking",
        )
    ),
    ],
) -> ApiResponse[OrderResponse]:
    order = update_order_admin_details(
        session,
        order_id=order_id,
        payload=payload,
    )

    return ApiResponse(
        success=True,
        data=order,
        message="Sipariş yönetim bilgileri güncellendi.",
    )