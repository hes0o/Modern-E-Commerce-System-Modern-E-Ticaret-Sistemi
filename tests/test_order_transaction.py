"""
Tests for transactional order creation and stock deduction (SRS §7, §8).

Verifies:
- Happy path: order created, stock deducted, movements logged
- Insufficient stock: entire transaction rolls back
- Order cancellation: stock released correctly
"""

import pytest
from sqlmodel import Session, select

from app.models.cart import Cart, CartItem
from app.models.enums import OrderStatus, PaymentMethod, StockMovementType
from app.models.order import Order, OrderItem, OrderStatusHistory
from app.models.product import Product
from app.models.stock import StockMovement
from app.services.order_service import (
    EmptyCartError,
    StockConflictError,
    cancel_order,
    create_order,
    update_order_status,
)
from app.services.order_state_machine import InvalidStateTransition


class TestOrderCreationHappyPath:
    """Test successful order creation with stock deduction."""

    def test_order_created_with_correct_totals(
        self, seeded_session: Session, sample_cart, sample_user, sample_product
    ):
        """Order should be created with correct financial calculations."""
        order = create_order(
            seeded_session,
            cart_id=sample_cart.id,
            user_id=sample_user.id,
            shipping_address_snapshot={"city": "İstanbul", "district": "Kadıköy"},
            payment_method=PaymentMethod.COD,
            contract_version_accepted="v1.0",
        )
        seeded_session.flush()

        assert order.order_number.startswith("SP-")
        assert order.status == OrderStatus.PENDING
        assert order.user_id == sample_user.id
        assert order.grand_total > 0

    def test_stock_deducted_on_order_creation(
        self, seeded_session: Session, sample_cart, sample_user, sample_product
    ):
        """Product stock should decrease by the ordered quantity."""
        initial_stock = sample_product.stock

        create_order(
            seeded_session,
            cart_id=sample_cart.id,
            user_id=sample_user.id,
            shipping_address_snapshot={"city": "İstanbul"},
            payment_method=PaymentMethod.COD,
            contract_version_accepted="v1.0",
        )
        seeded_session.flush()

        # Refresh product from DB
        seeded_session.refresh(sample_product)
        assert sample_product.stock == initial_stock - 2  # cart has qty=2

    def test_stock_movement_created(
        self, seeded_session: Session, sample_cart, sample_user, sample_product
    ):
        """A 'reserved' stock movement should be logged."""
        create_order(
            seeded_session,
            cart_id=sample_cart.id,
            user_id=sample_user.id,
            shipping_address_snapshot={"city": "İstanbul"},
            payment_method=PaymentMethod.COD,
            contract_version_accepted="v1.0",
        )
        seeded_session.flush()

        movements = seeded_session.exec(
            select(StockMovement).where(
                StockMovement.product_id == sample_product.id
            )
        ).all()

        assert len(movements) == 1
        assert movements[0].movement_type == StockMovementType.RESERVED
        assert movements[0].quantity == 2
        assert movements[0].stock_before == 50
        assert movements[0].stock_after == 48

    def test_order_status_history_created(
        self, seeded_session: Session, sample_cart, sample_user
    ):
        """Initial 'pending' status should be recorded in history."""
        order = create_order(
            seeded_session,
            cart_id=sample_cart.id,
            user_id=sample_user.id,
            shipping_address_snapshot={"city": "İstanbul"},
            payment_method=PaymentMethod.COD,
            contract_version_accepted="v1.0",
        )
        seeded_session.flush()

        history = seeded_session.exec(
            select(OrderStatusHistory).where(
                OrderStatusHistory.order_id == order.id
            )
        ).all()

        assert len(history) == 1
        assert history[0].old_status is None
        assert history[0].new_status == "pending"

    def test_cart_cleared_after_order(
        self, seeded_session: Session, sample_cart, sample_user
    ):
        """Cart items should be removed after successful order creation."""
        create_order(
            seeded_session,
            cart_id=sample_cart.id,
            user_id=sample_user.id,
            shipping_address_snapshot={"city": "İstanbul"},
            payment_method=PaymentMethod.COD,
            contract_version_accepted="v1.0",
        )
        seeded_session.flush()

        remaining = seeded_session.exec(
            select(CartItem).where(CartItem.cart_id == sample_cart.id)
        ).all()
        assert len(remaining) == 0


class TestOrderCreationFailures:
    """Test that failures roll back completely."""

    def test_empty_cart_raises_error(self, seeded_session: Session, sample_user):
        """Creating an order from an empty cart should fail."""
        empty_cart = Cart(user_id=sample_user.id)
        seeded_session.add(empty_cart)
        seeded_session.flush()

        with pytest.raises(EmptyCartError):
            create_order(
                seeded_session,
                cart_id=empty_cart.id,
                user_id=sample_user.id,
                shipping_address_snapshot={"city": "İstanbul"},
                payment_method=PaymentMethod.COD,
                contract_version_accepted="v1.0",
            )

    def test_insufficient_stock_raises_conflict(
        self, seeded_session: Session, sample_user, sample_product, sample_category
    ):
        """Ordering more than available stock should raise StockConflictError."""
        # Create a cart with quantity exceeding stock
        cart = Cart(user_id=None, session_token="guest-test-123")
        seeded_session.add(cart)
        seeded_session.flush()

        item = CartItem(
            cart_id=cart.id,
            product_id=sample_product.id,
            quantity=999,  # Way more than the 50 in stock
        )
        seeded_session.add(item)
        seeded_session.flush()

        with pytest.raises(StockConflictError) as exc_info:
            create_order(
                seeded_session,
                cart_id=cart.id,
                guest_name="Test Guest",
                guest_email="guest@test.com",
                guest_phone="555-0123",
                shipping_address_snapshot={"city": "Ankara"},
                payment_method=PaymentMethod.BANK_TRANSFER,
                contract_version_accepted="v1.0",
            )

        assert len(exc_info.value.conflicts) == 1
        assert exc_info.value.conflicts[0]["available"] == 50
        assert exc_info.value.conflicts[0]["requested"] == 999


class TestOrderCancellation:
    """Test order cancellation and stock release."""

    def test_cancel_releases_stock(
        self, seeded_session: Session, sample_cart, sample_user, sample_product
    ):
        """Cancelling an order should restore the reserved stock."""
        order = create_order(
            seeded_session,
            cart_id=sample_cart.id,
            user_id=sample_user.id,
            shipping_address_snapshot={"city": "İstanbul"},
            payment_method=PaymentMethod.COD,
            contract_version_accepted="v1.0",
        )
        seeded_session.flush()

        # Verify stock was deducted
        seeded_session.refresh(sample_product)
        assert sample_product.stock == 48

        # Cancel the order
        cancel_order(
            seeded_session,
            order=order,
            cancelled_by_user_id=sample_user.id,
            note="Customer requested cancellation",
        )
        seeded_session.flush()

        # Verify stock was restored
        seeded_session.refresh(sample_product)
        assert sample_product.stock == 50

        # Verify released movement was logged
        released = seeded_session.exec(
            select(StockMovement).where(
                StockMovement.movement_type == StockMovementType.RELEASED
            )
        ).all()
        assert len(released) == 1
        assert released[0].quantity == 2

    def test_cancel_records_status_history(
        self, seeded_session: Session, sample_cart, sample_user
    ):
        """Cancellation should add a status history entry."""
        order = create_order(
            seeded_session,
            cart_id=sample_cart.id,
            user_id=sample_user.id,
            shipping_address_snapshot={"city": "İstanbul"},
            payment_method=PaymentMethod.COD,
            contract_version_accepted="v1.0",
        )
        seeded_session.flush()

        cancel_order(
            seeded_session,
            order=order,
            cancelled_by_user_id=sample_user.id,
        )
        seeded_session.flush()

        history = seeded_session.exec(
            select(OrderStatusHistory)
            .where(OrderStatusHistory.order_id == order.id)
            .order_by(OrderStatusHistory.id)
        ).all()

        assert len(history) == 2
        assert history[1].old_status == "pending"
        assert history[1].new_status == "cancelled"

    def test_cannot_cancel_completed_order(
        self, seeded_session: Session, sample_cart, sample_user
    ):
        """Completed orders cannot be cancelled (SRS §7.3)."""
        order = create_order(
            seeded_session,
            cart_id=sample_cart.id,
            user_id=sample_user.id,
            shipping_address_snapshot={"city": "İstanbul"},
            payment_method=PaymentMethod.COD,
            contract_version_accepted="v1.0",
        )
        seeded_session.flush()

        # Manually advance to completed (bypassing state machine for test setup)
        order.status = OrderStatus.COMPLETED
        seeded_session.add(order)
        seeded_session.flush()

        with pytest.raises(InvalidStateTransition):
            cancel_order(
                seeded_session,
                order=order,
                cancelled_by_user_id=sample_user.id,
            )


class TestOrderStatusUpdate:
    """Test order status update with state machine validation."""

    def test_valid_status_progression(
        self, seeded_session: Session, sample_cart, sample_user
    ):
        """Full order lifecycle: pending → confirmed → preparing → shipped → completed."""
        order = create_order(
            seeded_session,
            cart_id=sample_cart.id,
            user_id=sample_user.id,
            shipping_address_snapshot={"city": "İstanbul"},
            payment_method=PaymentMethod.COD,
            contract_version_accepted="v1.0",
        )
        seeded_session.flush()

        # pending → confirmed
        update_order_status(
            seeded_session,
            order=order,
            new_status=OrderStatus.CONFIRMED,
            changed_by_user_id=sample_user.id,
        )
        assert order.status == OrderStatus.CONFIRMED

        # confirmed → preparing
        update_order_status(
            seeded_session,
            order=order,
            new_status=OrderStatus.PREPARING,
            changed_by_user_id=sample_user.id,
        )
        assert order.status == OrderStatus.PREPARING

        # preparing → shipped
        update_order_status(
            seeded_session,
            order=order,
            new_status=OrderStatus.SHIPPED,
            changed_by_user_id=sample_user.id,
        )
        assert order.status == OrderStatus.SHIPPED

        # shipped → completed
        update_order_status(
            seeded_session,
            order=order,
            new_status=OrderStatus.COMPLETED,
            changed_by_user_id=sample_user.id,
        )
        assert order.status == OrderStatus.COMPLETED

    def test_invalid_status_skip_raises(
        self, seeded_session: Session, sample_cart, sample_user
    ):
        """Cannot skip states (e.g., pending → shipped)."""
        order = create_order(
            seeded_session,
            cart_id=sample_cart.id,
            user_id=sample_user.id,
            shipping_address_snapshot={"city": "İstanbul"},
            payment_method=PaymentMethod.COD,
            contract_version_accepted="v1.0",
        )
        seeded_session.flush()

        with pytest.raises(InvalidStateTransition):
            update_order_status(
                seeded_session,
                order=order,
                new_status=OrderStatus.SHIPPED,
                changed_by_user_id=sample_user.id,
            )
