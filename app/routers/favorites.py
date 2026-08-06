from typing import Annotated

from fastapi import APIRouter, Depends, status
from sqlmodel import Session

from app.core.dependencies import get_current_user
from app.database import get_session
from app.models.user import User
from app.schemas.common import ApiResponse
from app.schemas.favorite import (
    FavoriteCreate,
    FavoriteResponse,
)
from app.services.favorite_service import (
    add_product_to_favorites,
    list_user_favorites,
    remove_product_from_favorites,
)

router = APIRouter(
    prefix="/api/favorites",
    tags=["Favorites"],
)


@router.get(
    "",
    response_model=ApiResponse[list[FavoriteResponse]],
)
def get_favorite_list(
    session: Annotated[Session, Depends(get_session)],
    current_user: Annotated[
        User,
        Depends(get_current_user),
    ],
) -> ApiResponse[list[FavoriteResponse]]:
    favorites = list_user_favorites(
        session,
        current_user,
    )

    return ApiResponse(
        success=True,
        data=favorites,
        message="Favoriler getirildi.",
    )


@router.post(
    "",
    response_model=ApiResponse[FavoriteResponse],
    status_code=status.HTTP_201_CREATED,
)
def create_favorite(
    favorite_data: FavoriteCreate,
    session: Annotated[Session, Depends(get_session)],
    current_user: Annotated[
        User,
        Depends(get_current_user),
    ],
) -> ApiResponse[FavoriteResponse]:
    favorite = add_product_to_favorites(
        session,
        current_user=current_user,
        product_id=favorite_data.product_id,
    )

    return ApiResponse(
        success=True,
        data=favorite,
        message="Ürün favorilere eklendi.",
    )


@router.delete(
    "/{product_id}",
    response_model=ApiResponse[None],
)
def delete_favorite(
    product_id: int,
    session: Annotated[Session, Depends(get_session)],
    current_user: Annotated[
        User,
        Depends(get_current_user),
    ],
) -> ApiResponse[None]:
    remove_product_from_favorites(
        session,
        current_user=current_user,
        product_id=product_id,
    )

    return ApiResponse(
        success=True,
        data=None,
        message="Ürün favorilerden çıkarıldı.",
    )
 