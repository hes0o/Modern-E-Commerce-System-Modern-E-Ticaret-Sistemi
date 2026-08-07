from typing import Optional, Union, Any
import secrets

from sqlmodel import Session

from app.core.exceptions import (
    BusinessRuleError,
    NotFoundError,
)
from app.models.base import utc_now
from app.models.cart import Cart, CartItem
from app.models.enums import ProductStatus
from app.models.product import Product, ProductVariant
from app.models.user import User
from app.repositories.cart_repository import (
    clear_cart_items,
    create_cart,
    delete_cart_item,
    get_cart_by_session_token,
    get_cart_by_user_id,
    get_cart_item_by_id,
    get_cart_items,
    get_matching_cart_item,
    save_cart_item,
)
from app.schemas.cart import (
    CartItemAdd,
    CartItemResponse,
    CartResponse,
)


def get_or_create_cart(
    session: Session,
    *,
    current_user: Optional[User],
    session_token: Optional[str],
) -> Cart:
    if current_user is not None:
        cart = get_cart_by_user_id(
            session,
            current_user.id,
        )

        if cart is not None:
            return cart

        return create_cart(
            session,
            Cart(user_id=current_user.id),
        )

    if session_token:
        cart = get_cart_by_session_token(
            session,
            session_token,
        )

        if cart is not None:
            return cart

    return create_cart(
        session,
        Cart(
            session_token=secrets.token_urlsafe(32),
        ),
    )


def get_product_and_variant(
    session: Session,
    *,
    product_id: int,
    variant_id: Optional[int],
) -> tuple[Product, Optional[ProductVariant]]:
    product = session.get(Product, product_id)

    if (
        product is None
        or product.status != ProductStatus.PUBLISHED
    ):
        raise NotFoundError(
            "Ürün bulunamadı veya satışta değil."
        )

    if product.has_variants:
        if variant_id is None:
            raise BusinessRuleError(
                "Bu ürün için bir varyant seçmelisiniz."
            )

        variant = session.get(
            ProductVariant,
            variant_id,
        )

        if (
            variant is None
            or variant.product_id != product.id
        ):
            raise NotFoundError(
                "Ürün varyantı bulunamadı."
            )

        return product, variant

    if variant_id is not None:
        raise BusinessRuleError(
            "Bu ürünün varyantı bulunmuyor."
        )

    return product, None


def get_stock_and_prices(
    product: Product,
    variant: Optional[ProductVariant],
) -> tuple[int, float, float]:
    if variant is not None:
        stock = variant.stock
        original_price = float(
            variant.price
            if variant.price is not None
            else product.price
        )
        discount_price = (
            float(variant.discount_price)
            if variant.discount_price is not None
            else (
                float(product.discount_price)
                if product.discount_price is not None
                else original_price
            )
        )
        return stock, original_price, discount_price

    stock = product.stock or 0
    original_price = float(product.price)
    discount_price = (
        float(product.discount_price)
        if product.discount_price is not None
        else original_price
    )
    return stock, original_price, discount_price


def build_cart_response(
    session: Session,
    cart: Cart,
) -> CartResponse:
    cart_items = get_cart_items(
        session,
        cart.id,
    )

    item_responses: list[CartItemResponse] = []
    subtotal = 0.0
    discount_total = 0.0
    vat_total = 0.0
    grand_total = 0.0
    total_quantity = 0

    for item in cart_items:
        product = session.get(
            Product,
            item.product_id,
        )

        if product is None:
            continue

        variant = (
            session.get(
                ProductVariant,
                item.variant_id,
            )
            if item.variant_id is not None
            else None
        )

        stock, original_price, unit_price = (
            get_stock_and_prices(product, variant)
        )

        original_line_total = (
            original_price * item.quantity
        )
        line_total = unit_price * item.quantity
        item_discount = (
            original_line_total - line_total
        )
        vat_rate = float(product.vat_rate)
        included_vat = (
            line_total * vat_rate / (100 + vat_rate)
            if vat_rate > 0
            else 0
        )

        subtotal += original_line_total
        discount_total += item_discount
        vat_total += included_vat
        grand_total += line_total
        total_quantity += item.quantity

        item_responses.append(
            CartItemResponse(
                id=item.id,
                product_id=product.id,
                variant_id=item.variant_id,
                product_name=product.name,
                product_slug=product.slug,
                sku=(
                    variant.sku
                    if variant is not None
                    else product.sku
                ),
                quantity=item.quantity,
                stock=stock,
                original_unit_price=round(
                    original_price,
                    2,
                ),
                unit_price=round(unit_price, 2),
                discount_amount=round(
                    item_discount,
                    2,
                ),
                line_total=round(line_total, 2),
            )
        )

    return CartResponse(
        id=cart.id,
        session_token=cart.session_token,
        items=item_responses,
        total_quantity=total_quantity,
        subtotal=round(subtotal, 2),
        discount_total=round(discount_total, 2),
        vat_total=round(vat_total, 2),
        grand_total=round(grand_total, 2),
        updated_at=cart.updated_at,
    )


def get_cart_response(
    session: Session,
    *,
    current_user: Optional[User],
    session_token: Optional[str],
) -> CartResponse:
    cart = get_or_create_cart(
        session,
        current_user=current_user,
        session_token=session_token,
    )
    return build_cart_response(session, cart)


def add_item_to_cart(
    session: Session,
    *,
    current_user: Optional[User],
    session_token: Optional[str],
    item_data: CartItemAdd,
) -> CartResponse:
    cart = get_or_create_cart(
        session,
        current_user=current_user,
        session_token=session_token,
    )
    product, variant = get_product_and_variant(
        session,
        product_id=item_data.product_id,
        variant_id=item_data.variant_id,
    )
    stock, _, _ = get_stock_and_prices(
        product,
        variant,
    )

    existing_item = get_matching_cart_item(
        session,
        cart_id=cart.id,
        product_id=item_data.product_id,
        variant_id=item_data.variant_id,
    )

    new_quantity = item_data.quantity

    if existing_item is not None:
        new_quantity += existing_item.quantity

    if new_quantity > stock:
        raise BusinessRuleError(
            f"Yeterli stok yok. Kullanılabilir stok: {stock}."
        )

    if existing_item is None:
        existing_item = CartItem(
            cart_id=cart.id,
            product_id=item_data.product_id,
            variant_id=item_data.variant_id,
            quantity=new_quantity,
        )
    else:
        existing_item.quantity = new_quantity

    cart.updated_at = utc_now()

    save_cart_item(
        session,
        cart=cart,
        item=existing_item,
    )

    return build_cart_response(session, cart)


def update_cart_item_quantity(
    session: Session,
    *,
    current_user: Optional[User],
    session_token: Optional[str],
    item_id: int,
    quantity: int,
) -> CartResponse:
    cart = get_or_create_cart(
        session,
        current_user=current_user,
        session_token=session_token,
    )
    item = get_cart_item_by_id(
        session,
        cart_id=cart.id,
        item_id=item_id,
    )

    if item is None:
        raise NotFoundError(
            "Sepet ürünü bulunamadı."
        )

    product, variant = get_product_and_variant(
        session,
        product_id=item.product_id,
        variant_id=item.variant_id,
    )
    stock, _, _ = get_stock_and_prices(
        product,
        variant,
    )

    if quantity > stock:
        raise BusinessRuleError(
            f"Yeterli stok yok. Kullanılabilir stok: {stock}."
        )

    item.quantity = quantity
    cart.updated_at = utc_now()

    save_cart_item(
        session,
        cart=cart,
        item=item,
    )

    return build_cart_response(session, cart)


def remove_item_from_cart(
    session: Session,
    *,
    current_user: Optional[User],
    session_token: Optional[str],
    item_id: int,
) -> CartResponse:
    cart = get_or_create_cart(
        session,
        current_user=current_user,
        session_token=session_token,
    )
    item = get_cart_item_by_id(
        session,
        cart_id=cart.id,
        item_id=item_id,
    )

    if item is None:
        raise NotFoundError(
            "Sepet ürünü bulunamadı."
        )

    cart.updated_at = utc_now()

    delete_cart_item(
        session,
        cart=cart,
        item=item,
    )

    return build_cart_response(session, cart)


def clear_cart(
    session: Session,
    *,
    current_user: Optional[User],
    session_token: Optional[str],
) -> CartResponse:
    cart = get_or_create_cart(
        session,
        current_user=current_user,
        session_token=session_token,
    )
    items = get_cart_items(
        session,
        cart.id,
    )
    cart.updated_at = utc_now()

    clear_cart_items(
        session,
        cart=cart,
        items=items,
    )

    return build_cart_response(session, cart)