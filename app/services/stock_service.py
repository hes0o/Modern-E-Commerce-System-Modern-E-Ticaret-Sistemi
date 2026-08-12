"""
Stock service (SRS §8).

Handles all stock operations with full movement logging. Every stock
change records a `StockMovement` with before/after values for auditability.
"""

from typing import Optional, Tuple, Union

from sqlalchemy import text
from sqlmodel import Session, select

from app.models.enums import StockMovementType
from app.models.product import Product, ProductVariant
from app.models.stock import StockMovement


class InsufficientStockError(Exception):
    """Raised when a stock operation would result in negative stock."""

    def __init__(
        self,
        product_id: int,
        variant_id: Optional[int],
        requested: int,
        available: int,
    ) -> None:
        self.product_id = product_id
        self.variant_id = variant_id
        self.requested = requested
        self.available = available
        super().__init__(
            f"Insufficient stock for product={product_id}, variant={variant_id}: "
            f"requested={requested}, available={available}"
        )


def _get_current_stock(
    session: Session,
    product_id: int,
    variant_id: Optional[int],
    *,
    lock: bool = False,
) -> Tuple[Union[Product, ProductVariant], int]:
    """
    Fetch the current stock level for a product or variant.

    When `lock=True`, uses SELECT ... FOR UPDATE to acquire a row-level
    lock, preventing concurrent modifications (critical for order creation).

    Returns:
        Tuple of (model_instance, current_stock).
    """
    if variant_id:
        stmt = select(ProductVariant).where(ProductVariant.id == variant_id)
        if lock:
            stmt = stmt.with_for_update()
        variant = session.exec(stmt).one()
        return variant, variant.stock
    else:
        stmt = select(Product).where(Product.id == product_id)
        if lock:
            stmt = stmt.with_for_update()
        product = session.exec(stmt).one()
        if product.stock is None:
            raise ValueError(
                f"Product {product_id} has has_variants=True but no variant_id provided."
            )
        return product, product.stock


def _record_movement(
    session: Session,
    *,
    product_id: int,
    variant_id: Optional[int],
    movement_type: StockMovementType,
    quantity: int,
    stock_before: int,
    stock_after: int,
    order_id: Optional[int] = None,
    user_id: Optional[int] = None,
    note: Optional[str] = None,
) -> StockMovement:
    """Create a stock movement record."""
    movement = StockMovement(
        product_id=product_id,
        variant_id=variant_id,
        movement_type=movement_type,
        quantity=quantity,
        stock_before=stock_before,
        stock_after=stock_after,
        related_order_id=order_id,
        created_by_user_id=user_id,
        note=note,
    )
    session.add(movement)
    return movement


def reserve_stock(
    session: Session,
    *,
    product_id: int,
    variant_id: Optional[int],
    quantity: int,
    order_id: Optional[int],
) -> StockMovement:
    """
    Reserve stock for an order item (atomic deduction with row lock).

    Called within a transaction during order creation. Uses SELECT...FOR UPDATE
    to prevent race conditions.

    Raises:
        InsufficientStockError: If current stock < requested quantity.
    """
    entity, current_stock = _get_current_stock(
        session, product_id, variant_id, lock=True
    )

    if current_stock < quantity:
        raise InsufficientStockError(product_id, variant_id, quantity, current_stock)

    new_stock = current_stock - quantity

    # Update the stock on the entity
    entity.stock = new_stock
    session.add(entity)

    return _record_movement(
        session,
        product_id=product_id,
        variant_id=variant_id,
        movement_type=StockMovementType.RESERVED,
        quantity=quantity,
        stock_before=current_stock,
        stock_after=new_stock,
        order_id=order_id,
    )


def release_stock(
    session: Session,
    *,
    product_id: int,
    variant_id: Optional[int],
    quantity: int,
    order_id: int,
    user_id: Optional[int] = None,
) -> StockMovement:
    """
    Release previously reserved stock (order cancellation).

    Returns stock to the product/variant and creates a 'released' movement.
    """
    entity, current_stock = _get_current_stock(
        session, product_id, variant_id, lock=True
    )

    new_stock = current_stock + quantity
    entity.stock = new_stock
    session.add(entity)

    return _record_movement(
        session,
        product_id=product_id,
        variant_id=variant_id,
        movement_type=StockMovementType.RELEASED,
        quantity=quantity,
        stock_before=current_stock,
        stock_after=new_stock,
        order_id=order_id,
        user_id=user_id,
        note=f"Stock released due to order cancellation (Order #{order_id})",
    )


def manual_stock_in(
    session: Session,
    *,
    product_id: int,
    variant_id: Optional[int],
    quantity: int,
    user_id: int,
    note: Optional[str] = None,
) -> StockMovement:
    """
    Manual stock entry (admin: purchase, supplier delivery).

    Increases stock by the given quantity.
    """
    entity, current_stock = _get_current_stock(
        session, product_id, variant_id, lock=True
    )

    new_stock = current_stock + quantity
    entity.stock = new_stock
    session.add(entity)

    return _record_movement(
        session,
        product_id=product_id,
        variant_id=variant_id,
        movement_type=StockMovementType.IN,
        quantity=quantity,
        stock_before=current_stock,
        stock_after=new_stock,
        user_id=user_id,
        note=note,
    )


def manual_stock_out(
    session: Session,
    *,
    product_id: int,
    variant_id: Optional[int],
    quantity: int,
    user_id: int,
    note: Optional[str] = None,
) -> StockMovement:
    """
    Manual stock exit (admin: damage, fire, count difference).

    Decreases stock. Raises InsufficientStockError if stock would go negative.
    """
    entity, current_stock = _get_current_stock(
        session, product_id, variant_id, lock=True
    )

    if current_stock < quantity:
        raise InsufficientStockError(product_id, variant_id, quantity, current_stock)

    new_stock = current_stock - quantity
    entity.stock = new_stock
    session.add(entity)

    return _record_movement(
        session,
        product_id=product_id,
        variant_id=variant_id,
        movement_type=StockMovementType.OUT,
        quantity=quantity,
        stock_before=current_stock,
        stock_after=new_stock,
        user_id=user_id,
        note=note,
    )


def stock_adjustment(
    session: Session,
    *,
    product_id: int,
    variant_id: Optional[int],
    new_stock_count: int,
    user_id: int,
    note: Optional[str] = None,
) -> StockMovement:
    """
    Physical count adjustment (admin: sets absolute stock level).

    Used after physical inventory counts to correct system stock.
    """
    entity, current_stock = _get_current_stock(
        session, product_id, variant_id, lock=True
    )

    difference = abs(new_stock_count - current_stock)
    entity.stock = new_stock_count
    session.add(entity)

    return _record_movement(
        session,
        product_id=product_id,
        variant_id=variant_id,
        movement_type=StockMovementType.ADJUSTMENT,
        quantity=difference,
        stock_before=current_stock,
        stock_after=new_stock_count,
        user_id=user_id,
        note=note or f"Physical count adjustment: {current_stock} → {new_stock_count}",
    )


def check_low_stock(
    session: Session,
    product_id: int,
    variant_id: Optional[int],
) -> bool:
    """
    Check if the product/variant stock is at or below 15 or its minimum level.
    """
    entity, current_stock = _get_current_stock(session, product_id, variant_id)

    if current_stock <= 15:
        return True

    min_level = getattr(entity, "min_stock_level", None)
    if min_level is None:
        return False

    return current_stock <= min_level
