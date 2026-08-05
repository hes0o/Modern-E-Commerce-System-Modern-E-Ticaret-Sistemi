"""
Tests for the order state machine (SRS §7.3).

Verifies that valid transitions succeed and invalid transitions
are rejected, as specified in the state transition diagram.
"""

import pytest

from app.models.enums import OrderStatus
from app.services.order_state_machine import (
    InvalidStateTransition,
    get_allowed_transitions,
    is_cancellable,
    is_terminal,
    validate_transition,
)


class TestValidTransitions:
    """Test that all valid transitions from the SRS are accepted."""

    @pytest.mark.parametrize(
        "current,requested",
        [
            (OrderStatus.PENDING, OrderStatus.CONFIRMED),
            (OrderStatus.PENDING, OrderStatus.CANCELLED),
            (OrderStatus.CONFIRMED, OrderStatus.PREPARING),
            (OrderStatus.CONFIRMED, OrderStatus.CANCELLED),
            (OrderStatus.PREPARING, OrderStatus.SHIPPED),
            (OrderStatus.PREPARING, OrderStatus.CANCELLED),
            (OrderStatus.SHIPPED, OrderStatus.COMPLETED),
        ],
    )
    def test_valid_transition_succeeds(self, current, requested):
        """Valid transition should not raise an exception."""
        validate_transition(current, requested)  # Should not raise


class TestInvalidTransitions:
    """Test that invalid transitions are rejected with clear errors."""

    @pytest.mark.parametrize(
        "current,requested",
        [
            # Terminal states → cannot transition
            (OrderStatus.COMPLETED, OrderStatus.PENDING),
            (OrderStatus.COMPLETED, OrderStatus.CONFIRMED),
            (OrderStatus.COMPLETED, OrderStatus.CANCELLED),
            (OrderStatus.CANCELLED, OrderStatus.PENDING),
            (OrderStatus.CANCELLED, OrderStatus.CONFIRMED),
            # Backward transitions
            (OrderStatus.CONFIRMED, OrderStatus.PENDING),
            (OrderStatus.PREPARING, OrderStatus.CONFIRMED),
            (OrderStatus.SHIPPED, OrderStatus.PREPARING),
            # Skipping states
            (OrderStatus.PENDING, OrderStatus.SHIPPED),
            (OrderStatus.PENDING, OrderStatus.COMPLETED),
            (OrderStatus.CONFIRMED, OrderStatus.SHIPPED),
            (OrderStatus.CONFIRMED, OrderStatus.COMPLETED),
            # Shipped → cancelled (not allowed per SRS)
            (OrderStatus.SHIPPED, OrderStatus.CANCELLED),
        ],
    )
    def test_invalid_transition_raises(self, current, requested):
        """Invalid transition should raise InvalidStateTransition."""
        with pytest.raises(InvalidStateTransition) as exc_info:
            validate_transition(current, requested)

        assert exc_info.value.current == current
        assert exc_info.value.requested == requested


class TestHelperFunctions:
    """Test utility functions."""

    def test_get_allowed_transitions_pending(self):
        """Pending can go to confirmed or cancelled."""
        allowed = get_allowed_transitions(OrderStatus.PENDING)
        assert allowed == {OrderStatus.CONFIRMED, OrderStatus.CANCELLED}

    def test_get_allowed_transitions_completed(self):
        """Completed is terminal — no transitions allowed."""
        allowed = get_allowed_transitions(OrderStatus.COMPLETED)
        assert allowed == set()

    def test_is_terminal_completed(self):
        assert is_terminal(OrderStatus.COMPLETED) is True

    def test_is_terminal_cancelled(self):
        assert is_terminal(OrderStatus.CANCELLED) is True

    def test_is_not_terminal_pending(self):
        assert is_terminal(OrderStatus.PENDING) is False

    def test_is_cancellable_pending(self):
        assert is_cancellable(OrderStatus.PENDING) is True

    def test_is_cancellable_confirmed(self):
        assert is_cancellable(OrderStatus.CONFIRMED) is True

    def test_is_cancellable_preparing(self):
        assert is_cancellable(OrderStatus.PREPARING) is True

    def test_is_not_cancellable_shipped(self):
        """Once shipped, cannot be cancelled (per SRS)."""
        assert is_cancellable(OrderStatus.SHIPPED) is False

    def test_is_not_cancellable_completed(self):
        assert is_cancellable(OrderStatus.COMPLETED) is False
