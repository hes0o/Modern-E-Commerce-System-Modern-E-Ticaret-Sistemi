"""
Order service — transactional order creation (SRS §7.1, §A.2.1).

The `create_order` function wraps the entire order creation flow in a
single database transaction. If any step fails (e.g., insufficient stock),
the entire transaction rolls back and no partial data is committed.

Transaction flow:
    BEGIN TRANSACTION
    ├─ Validate cart items
    ├─ For each item:
    │   ├─ SELECT ... FOR UPDATE (row lock)
    │   ├─ Check stock >= quantity
    │   ├─ Deduct stock
    │   └─ INSERT stock_movement
    ├─ Generate unique order_number
    ├─ INSERT order + order_items
    ├─ INSERT order_status_history (initial 'pending')
    ├─ Check low-stock triggers
    COMMIT
"""

import secrets
from datetime import UTC, datetime

from sqlmodel import Session, select

from app.models.cart import CartItem
from app.models.enums import OrderStatus, PaymentMethod
from app.models.order import Order, OrderItem, OrderStatusHistory
from app.models.product import Product, ProductVariant
from app.services.notification_service import queue_notification
from app.services.stock_service import InsufficientStockError, check_low_stock, reserve_stock


class OrderCreationError(Exception):
    """Base exception for order creation failures."""


class EmptyCartError(OrderCreationError):
    """Raised when attempting to create an order from an empty cart."""


class StockConflictError(OrderCreationError):
    """
    Raised when one or more cart items have insufficient stock.

    Includes details about which items failed (for the 409 response).
    """

    def __init__(self, conflicts: list[dict]) -> None:
        self.conflicts = conflicts
        super().__init__(f"Stock conflicts for {len(conflicts)} item(s)")


def _generate_order_number() -> str:
    """
    Generate a unique, unpredictable order number.

    Format: SP-YYYYMMDD-XXXXX (e.g., SP-20260802-A3F7K)
    The random suffix makes order numbers non-sequential and non-guessable.
    """
    date_part = datetime.now(UTC).strftime("%Y%m%d")
    random_part = secrets.token_hex(3).upper()[:5]
    return f"SP-{date_part}-{random_part}"


def _get_effective_price(
    product: Product,
    variant: ProductVariant | None,
) -> tuple[float, float | None]:
    """
    Determine the effective price and discount price for an item.
    """
    if variant and variant.price is not None:
        price = variant.price
        discount_price = variant.discount_price
    else:
        price = product.price
        discount_price = product.discount_price

    return (
        float(price),
        float(discount_price) if discount_price is not None else None,
    )


def create_order(
    session: Session,
    *,
    cart_id: int,
    user_id: int | None = None,
    guest_name: str | None = None,
    guest_email: str | None = None,
    guest_phone: str | None = None,
    shipping_address_snapshot: dict,
    billing_address_snapshot: dict | None = None,
    payment_method: PaymentMethod,
    customer_note: str | None = None,
    contract_version_accepted: str,
) -> Order:
    """
    Create an order from a cart — fully transactional.

    This function MUST be called within an active session transaction.
    If any stock deduction fails, the caller should catch the exception
    and let the session rollback.

    Args:
        session: Active SQLModel session (transaction managed by caller).
        cart_id: ID of the cart to convert to an order.
        user_id: Registered user ID (None for guest orders).
        guest_*: Guest customer details (required when user_id is None).
        shipping_address_snapshot: Immutable copy of the delivery address.
        billing_address_snapshot: Immutable copy of the billing address.
        payment_method: Selected payment method.
        customer_note: Optional note from the customer.
        contract_version_accepted: Version of the sales contract accepted.

    Returns:
        The created Order instance.

    Raises:
        EmptyCartError: If the cart has no items.
        StockConflictError: If any item has insufficient stock.
    """
    # 1. Load cart items
    cart_items = session.exec(select(CartItem).where(CartItem.cart_id == cart_id)).all()

    if not cart_items:
        raise EmptyCartError("Cannot create order from an empty cart.")

    # 2. Process each item: lock stock, validate, deduct
    order_items_data: list[dict] = []
    stock_conflicts: list[dict] = []
    low_stock_warnings: list[tuple[int, int | None]] = []  # (product_id, variant_id)
    reserved_movements = []
    subtotal = 0.0
    discount_total = 0.0
    vat_total = 0.0

    # Generate order number early so stock_movements can reference it
    order_number = _generate_order_number()

    for cart_item in cart_items:
        # Load product (always needed for name/price/vat)
        product = session.exec(select(Product).where(Product.id == cart_item.product_id)).one()

        # Load variant if applicable
        variant = None
        if cart_item.variant_id:
            variant = session.exec(
                select(ProductVariant).where(ProductVariant.id == cart_item.variant_id)
            ).one()

        # Determine effective pricing
        unit_price, unit_discount_price = _get_effective_price(product, variant)
        effective_price = unit_discount_price if unit_discount_price else unit_price
        line_total = effective_price * cart_item.quantity

        # Calculate line-level financials
        line_discount = (
            (unit_price - unit_discount_price) * cart_item.quantity if unit_discount_price else 0.0
        )
        vat_rate = float(product.vat_rate)
        line_vat = line_total * vat_rate / (100 + vat_rate)

        # 3. Try to reserve stock (SELECT ... FOR UPDATE + deduction)
        try:
            movement = reserve_stock(
                session,
                product_id=cart_item.product_id,
                variant_id=cart_item.variant_id,
                quantity=cart_item.quantity,
                order_id=None,  # Placeholder; updated after order creation
            )
            reserved_movements.append(movement)
        except InsufficientStockError as e:
            stock_conflicts.append(
                {
                    "product_id": e.product_id,
                    "variant_id": e.variant_id,
                    "requested": e.requested,
                    "available": e.available,
                    "product_name": product.name,
                }
            )
            continue

        # Check for low-stock warning
        if check_low_stock(session, cart_item.product_id, cart_item.variant_id):
            low_stock_warnings.append((cart_item.product_id, cart_item.variant_id))

        # Accumulate order item data
        order_items_data.append(
            {
                "product_id": cart_item.product_id,
                "variant_id": cart_item.variant_id,
                "product_name_snapshot": product.name,
                "unit_price": effective_price,
                "quantity": cart_item.quantity,
                "line_total": line_total,
            }
        )

        subtotal += unit_price * cart_item.quantity
        discount_total += line_discount
        vat_total += line_vat

    # 4. If ANY item had a stock conflict, roll back everything
    if stock_conflicts:
        raise StockConflictError(stock_conflicts)

    # 5. Create the Order record
    grand_total = subtotal - discount_total
    order = Order(
        order_number=order_number,
        user_id=user_id,
        guest_name=guest_name,
        guest_email=guest_email,
        guest_phone=guest_phone,
        shipping_address_snapshot=shipping_address_snapshot,
        billing_address_snapshot=billing_address_snapshot,
        payment_method=payment_method,
        status=OrderStatus.PENDING,
        subtotal=round(subtotal, 2),
        discount_total=round(discount_total, 2) if discount_total else None,
        vat_total=round(vat_total, 2),
        grand_total=round(grand_total, 2),
        customer_note=customer_note,
        contract_version_accepted=contract_version_accepted,
    )
    session.add(order)
    session.flush()  # Get the order.id for FK references

    # 6. Create OrderItem records
    for item_data in order_items_data:
        order_item = OrderItem(order_id=order.id, **item_data)
        session.add(order_item)

    # 7. Create initial status history entry
    history_entry = OrderStatusHistory(
        order_id=order.id,
        old_status=None,
        new_status=OrderStatus.PENDING.value,
        changed_by_user_id=user_id,
        note="Order created",
    )
    session.add(history_entry)

    # 8. Link this order's stock movements to the real order ID
    for movement in reserved_movements:
        movement.related_order_id = order.id
        session.add(movement)

    # Create an admin notification for the new order
    queue_notification(
        session,
        notification_type="new_order",
        title="Yeni Sipariş",
        message=f"{order.order_number} numaralı sipariş oluşturuldu.",
        related_entity_type="order",
        related_entity_id=order.id,
    )

    # Create automatic low/out-of-stock notifications
    for product_id, variant_id in set(low_stock_warnings):
        product = session.get(Product, product_id)
        variant = session.get(ProductVariant, variant_id) if variant_id is not None else None

        if product is None:
            continue

        remaining_stock = variant.stock if variant is not None else product.stock

        notification_type = "out_of_stock" if remaining_stock == 0 else "low_stock"
        title = "Stok Tükendi" if remaining_stock == 0 else "Kritik Stok Uyarısı"

        queue_notification(
            session,
            notification_type=notification_type,
            title=title,
            message=(f"{product.name} ürününün stoğu {remaining_stock} adede düştü."),
            related_entity_type="product",
            related_entity_id=product.id,
        )

    # 9. Clear the cart
    for cart_item in cart_items:
        session.delete(cart_item)

    return order


def cancel_order(
    session: Session,
    *,
    order: Order,
    cancelled_by_user_id: int | None = None,
    note: str | None = None,
) -> Order:
    """
    Cancel an order and release all reserved stock.

    Validates the state transition, releases stock for each item,
    and records the status change in history.

    Args:
        session: Active SQLModel session.
        order: The order to cancel.
        cancelled_by_user_id: ID of the user performing the cancellation.
        note: Optional cancellation reason.

    Raises:
        InvalidStateTransition: If the order cannot be cancelled from its current state.
    """
    from app.services.order_state_machine import validate_transition
    from app.services.stock_service import release_stock

    # Validate transition
    validate_transition(order.status, OrderStatus.CANCELLED)

    old_status = order.status

    # Release stock for each order item
    for item in order.items:
        release_stock(
            session,
            product_id=item.product_id,
            variant_id=item.variant_id,
            quantity=item.quantity,
            order_id=order.id,
            user_id=cancelled_by_user_id,
        )

    # Update order status
    order.status = OrderStatus.CANCELLED
    session.add(order)

    # Record status history
    history_entry = OrderStatusHistory(
        order_id=order.id,
        old_status=old_status.value,
        new_status=OrderStatus.CANCELLED.value,
        changed_by_user_id=cancelled_by_user_id,
        note=note or "Order cancelled",
    )
    session.add(history_entry)

    if order.user_id is not None:
        queue_notification(
            session,
            notification_type="order_status_changed",
            title="Sipariş Durumu Güncellendi",
            message=(f"{order.order_number} numaralı siparişiniz iptal edildi."),
            related_entity_type="order",
            related_entity_id=order.id,
            recipient_user_id=order.user_id,
        )

    return order


def update_order_status(
    session: Session,
    *,
    order: Order,
    new_status: OrderStatus,
    changed_by_user_id: int,
    note: str | None = None,
) -> Order:
    """
    Update order status with state machine validation.

    If transitioning to CANCELLED, delegates to `cancel_order` for stock release.

    Args:
        session: Active SQLModel session.
        order: The order to update.
        new_status: The desired new status.
        changed_by_user_id: ID of the admin/personnel making the change.
        note: Optional note for the status change.

    Raises:
        InvalidStateTransition: If the transition is not allowed.
    """
    if new_status == OrderStatus.CANCELLED:
        return cancel_order(
            session,
            order=order,
            cancelled_by_user_id=changed_by_user_id,
            note=note,
        )

    from app.services.order_state_machine import validate_transition

    validate_transition(order.status, new_status)

    old_status = order.status
    order.status = new_status
    session.add(order)

    history_entry = OrderStatusHistory(
        order_id=order.id,
        old_status=old_status.value,
        new_status=new_status.value,
        changed_by_user_id=changed_by_user_id,
        note=note,
    )
    session.add(history_entry)

    if order.user_id is not None:
        queue_notification(
            session,
            notification_type="order_status_changed",
            title="Sipariş Durumu Güncellendi",
            message=(
                f"{order.order_number} numaralı siparişinizin "
                f"durumu '{new_status.value}' olarak güncellendi."
            ),
            related_entity_type="order",
            related_entity_id=order.id,
            recipient_user_id=order.user_id,
        )

    return order
