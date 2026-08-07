from typing import Optional, Union, Any
from sqlmodel import Session, col, select

from app.models.favorite import Favorite


def get_favorites_by_user_id(
    session: Session,
    user_id: int,
) -> list[Favorite]:
    statement = (
        select(Favorite)
        .where(col(Favorite.user_id) == user_id)
        .order_by(col(Favorite.created_at).desc())
    )
    return list(session.exec(statement).all())


def get_favorite_by_user_and_product(
    session: Session,
    *,
    user_id: int,
    product_id: int,
) -> Optional[Favorite]:
    statement = select(Favorite).where(
        col(Favorite.user_id) == user_id,
        col(Favorite.product_id) == product_id,
    )
    return session.exec(statement).first()


def get_favorite_by_id_and_user_id(
    session: Session,
    *,
    favorite_id: int,
    user_id: int,
) -> Optional[Favorite]:
    statement = select(Favorite).where(
        col(Favorite.id) == favorite_id,
        col(Favorite.user_id) == user_id,
    )
    return session.exec(statement).first()


def create_favorite(
    session: Session,
    favorite: Favorite,
) -> Favorite:
    session.add(favorite)
    session.commit()
    session.refresh(favorite)
    return favorite


def delete_favorite(
    session: Session,
    favorite: Favorite,
) -> None:
    session.delete(favorite)
    session.commit()