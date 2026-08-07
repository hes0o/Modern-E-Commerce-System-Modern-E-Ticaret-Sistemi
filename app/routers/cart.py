from typing import Optional, Union, Any
from typing import Annotated

from fastapi import APIRouter, Depends, Header
from sqlmodel import Session

from app.core.dependencies import get_optional_current_user
from app.database import get_session
from app.models.user import User
from app.schemas.cart import (
    CartItemAdd,
    CartItemUpdate,
    CartResponse,
)
from app.schemas.common import ApiResponse
from app.services.cart_service import (
    add_item_to_cart,
    clear_cart,
    get_cart_response,
    remove_item_from_cart,
    update_cart_item_quantity,
)

router = APIRouter(
    prefix="/api/cart",
    tags=["Cart"],
)


SessionToken = Annotated[
    Optional[str],
    Header(
        alias="X-Session-Token",
        max_length=100,
    ),
]


@router.get(
    "",
    response_model=ApiResponse[CartResponse],
)
def get_cart(
    session: Annotated[Session, Depends(get_session)],
    current_user: Annotated[
        Optional[User],
        Depends(get_optional_current_user),
    ],
    session_token: SessionToken = None,
) -> ApiResponse[CartResponse]:
    cart = get_cart_response(
        session,
        current_user=current_user,
        session_token=session_token,
    )

    return ApiResponse(
        success=True,
        data=cart,
        message="Sepet getirildi.",
    )


@router.post(
    "/items",
    response_model=ApiResponse[CartResponse],
)
def add_cart_item(
    item_data: CartItemAdd,
    session: Annotated[Session, Depends(get_session)],
    current_user: Annotated[
        Optional[User],
        Depends(get_optional_current_user),
    ],
    session_token: SessionToken = None,
) -> ApiResponse[CartResponse]:
    cart = add_item_to_cart(
        session,
        current_user=current_user,
        session_token=session_token,
        item_data=item_data,
    )

    return ApiResponse(
        success=True,
        data=cart,
        message="Ürün sepete eklendi.",
    )


@router.put(
    "/items/{item_id}",
    response_model=ApiResponse[CartResponse],
)
def update_cart_item(
    item_id: int,
    item_data: CartItemUpdate,
    session: Annotated[Session, Depends(get_session)],
    current_user: Annotated[
        Optional[User],
        Depends(get_optional_current_user),
    ],
    session_token: SessionToken = None,
) -> ApiResponse[CartResponse]:
    cart = update_cart_item_quantity(
        session,
        current_user=current_user,
        session_token=session_token,
        item_id=item_id,
        quantity=item_data.quantity,
    )

    return ApiResponse(
        success=True,
        data=cart,
        message="Sepet ürün adedi güncellendi.",
    )


@router.delete(
    "/items/{item_id}",
    response_model=ApiResponse[CartResponse],
)
def delete_cart_item(
    item_id: int,
    session: Annotated[Session, Depends(get_session)],
    current_user: Annotated[
        Optional[User],
        Depends(get_optional_current_user),
    ],
    session_token: SessionToken = None,
) -> ApiResponse[CartResponse]:
    cart = remove_item_from_cart(
        session,
        current_user=current_user,
        session_token=session_token,
        item_id=item_id,
    )

    return ApiResponse(
        success=True,
        data=cart,
        message="Ürün sepetten çıkarıldı.",
    )


@router.delete(
    "/items",
    response_model=ApiResponse[CartResponse],
)
def delete_all_cart_items(
    session: Annotated[Session, Depends(get_session)],
    current_user: Annotated[
        Optional[User],
        Depends(get_optional_current_user),
    ],
    session_token: SessionToken = None,
) -> ApiResponse[CartResponse]:
    cart = clear_cart(
        session,
        current_user=current_user,
        session_token=session_token,
    )

    return ApiResponse(
        success=True,
        data=cart,
        message="Sepet temizlendi.",
    )