from typing import Optional, Union, Any
from sqlmodel import Session, col, select

from app.models.cart import Cart, CartItem


def get_cart_by_user_id(
    session: Session,
    user_id: int,
) -> Optional[Cart]:
    statement = select(Cart).where(
        col(Cart.user_id) == user_id,
    )
    return session.exec(statement).first()


def get_cart_by_session_token(
    session: Session,
    session_token: str,
) -> Optional[Cart]:
    statement = select(Cart).where(
        col(Cart.session_token) == session_token,
    )
    return session.exec(statement).first()


def get_cart_items(
    session: Session,
    cart_id: int,
) -> list[CartItem]:
    statement = (
        select(CartItem)
        .where(col(CartItem.cart_id) == cart_id)
        .order_by(col(CartItem.created_at))
    )
    return list(session.exec(statement).all())


def get_cart_item_by_id(
    session: Session,
    *,
    cart_id: int,
    item_id: int,
) -> Optional[CartItem]:
    statement = select(CartItem).where(
        col(CartItem.id) == item_id,
        col(CartItem.cart_id) == cart_id,
    )
    return session.exec(statement).first()


def get_matching_cart_item(
    session: Session,
    *,
    cart_id: int,
    product_id: int,
    variant_id: Optional[int],
) -> Optional[CartItem]:
    statement = select(CartItem).where(
        col(CartItem.cart_id) == cart_id,
        col(CartItem.product_id) == product_id,
    )

    if variant_id is None:
        statement = statement.where(
            col(CartItem.variant_id).is_(None),
        )
    else:
        statement = statement.where(
            col(CartItem.variant_id) == variant_id,
        )

    return session.exec(statement).first()


def create_cart(
    session: Session,
    cart: Cart,
) -> Cart:
    session.add(cart)
    session.commit()
    session.refresh(cart)
    return cart


def save_cart_item(
    session: Session,
    *,
    cart: Cart,
    item: CartItem,
) -> CartItem:
    session.add(cart)
    session.add(item)
    session.commit()
    session.refresh(cart)
    session.refresh(item)
    return item


def delete_cart_item(
    session: Session,
    *,
    cart: Cart,
    item: CartItem,
) -> None:
    session.add(cart)
    session.delete(item)
    session.commit()
    session.refresh(cart)


def clear_cart_items(
    session: Session,
    *,
    cart: Cart,
    items: list[CartItem],
) -> None:
    session.add(cart)

    for item in items:
        session.delete(item)

    session.commit()
    session.refresh(cart)