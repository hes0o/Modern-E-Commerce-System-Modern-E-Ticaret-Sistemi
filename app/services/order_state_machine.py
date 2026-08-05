"""
Order State Machine (SRS §7.3).

Enforces valid status transitions for orders. Invalid transitions
raise `InvalidStateTransition` to prevent data corruption.

Transition map:
    pending   → confirmed, cancelled
    confirmed → preparing, cancelled
    preparing → shipped, cancelled
    shipped   → completed
    completed → (terminal)
    cancelled → (terminal)
"""

from app.models.enums import OrderStatus


class InvalidStateTransition(Exception):
    """Raised when an order status transition violates the state machine rules."""

    def __init__(self, current: OrderStatus, requested: OrderStatus) -> None:
        self.current = current
        self.requested = requested
        super().__init__(
            f"Invalid order status transition: "
            f"'{current.value}' → '{requested.value}' is not allowed."
        )


# Valid transitions: maps each status to the set of statuses it can move to
_TRANSITIONS: dict[OrderStatus, set[OrderStatus]] = {
    OrderStatus.PENDING: {OrderStatus.CONFIRMED, OrderStatus.CANCELLED},
    OrderStatus.CONFIRMED: {OrderStatus.PREPARING, OrderStatus.CANCELLED},
    OrderStatus.PREPARING: {OrderStatus.SHIPPED, OrderStatus.CANCELLED},
    OrderStatus.SHIPPED: {OrderStatus.COMPLETED},
    OrderStatus.COMPLETED: set(),  # terminal state
    OrderStatus.CANCELLED: set(),  # terminal state
}


def validate_transition(current: OrderStatus, requested: OrderStatus) -> None:
    """
    Validate that a status transition is allowed.

    Args:
        current: The order's current status.
        requested: The desired new status.

    Raises:
        InvalidStateTransition: If the transition is not allowed.
    """
    allowed = _TRANSITIONS.get(current, set())
    if requested not in allowed:
        raise InvalidStateTransition(current, requested)


def get_allowed_transitions(current: OrderStatus) -> set[OrderStatus]:
    """Return the set of statuses reachable from the current status."""
    return _TRANSITIONS.get(current, set()).copy()


def is_terminal(status: OrderStatus) -> bool:
    """Check if a status is a terminal (final) state."""
    return len(_TRANSITIONS.get(status, set())) == 0


def is_cancellable(status: OrderStatus) -> bool:
    """Check if an order in this status can still be cancelled."""
    return OrderStatus.CANCELLED in _TRANSITIONS.get(status, set())
