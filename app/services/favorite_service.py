from sqlmodel import Session

from app.core.exceptions import (
    ConflictError,
    NotFoundError,
)
from app.models.enums import ProductStatus
from app.models.favorite import Favorite
from app.models.product import Product
from app.models.user import User
from app.repositories.favorite_repository import (
    create_favorite,
    delete_favorite,
    get_favorite_by_user_and_product,
    get_favorites_by_user_id,
)
from app.schemas.favorite import FavoriteResponse


def create_favorite_response(
    favorite: Favorite,
    product: Product,
) -> FavoriteResponse:
    return FavoriteResponse(
        id=favorite.id,
        product_id=product.id,
        product_name=product.name,
        product_slug=product.slug,
        sku=product.sku,
        price=float(product.price),
        discount_price=(
            float(product.discount_price)
            if product.discount_price is not None
            else None
        ),
        stock=product.stock,
        created_at=favorite.created_at,
    )


def list_user_favorites(
    session: Session,
    current_user: User,
) -> list[FavoriteResponse]:
    favorites = get_favorites_by_user_id(
        session,
        current_user.id,
    )
    responses: list[FavoriteResponse] = []

    for favorite in favorites:
        product = session.get(
            Product,
            favorite.product_id,
        )

        if (
            product is None
            or product.status != ProductStatus.PUBLISHED
        ):
            continue

        responses.append(
            create_favorite_response(
                favorite,
                product,
            )
        )

    return responses


def add_product_to_favorites(
    session: Session,
    *,
    current_user: User,
    product_id: int,
) -> FavoriteResponse:
    product = session.get(Product, product_id)

    if (
        product is None
        or product.status != ProductStatus.PUBLISHED
    ):
        raise NotFoundError(
            "Ürün bulunamadı veya satışta değil."
        )

    existing_favorite = (
        get_favorite_by_user_and_product(
            session,
            user_id=current_user.id,
            product_id=product_id,
        )
    )

    if existing_favorite is not None:
        raise ConflictError(
            "Bu ürün zaten favorilerinizde."
        )

    favorite = create_favorite(
        session,
        Favorite(
            user_id=current_user.id,
            product_id=product_id,
        ),
    )

    return create_favorite_response(
        favorite,
        product,
    )


def remove_product_from_favorites(
    session: Session,
    *,
    current_user: User,
    product_id: int,
) -> None:
    favorite = get_favorite_by_user_and_product(
        session,
        user_id=current_user.id,
        product_id=product_id,
    )

    if favorite is None:
        raise NotFoundError(
            "Favori kaydı bulunamadı."
        )

    delete_favorite(session, favorite)