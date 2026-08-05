"""
Audit middleware — decorators for automatic audit logging.

Provides `@audited` decorator that your teammates can use on their
API endpoint handler functions to automatically log changes.

Usage in a FastAPI endpoint:

    @router.put("/admin/products/{product_id}/price")
    @audited(action="product.price_updated", tracked_fields=["price", "discount_price"])
    async def update_product_price(product_id: int, ...):
        ...
"""

import functools
from typing import Any, Callable

from sqlmodel import Session

from app.services.audit_service import audit_change, log_action


def audited(
    action: str,
    entity_type: Optional[str] = None,
    tracked_fields: List[str] | None = None,
) -> Callable:
    """
    Decorator for automatically audit-logging changes made by a function.

    The decorated function must accept `session`, `user_id`, and the
    entity instance as arguments. The decorator captures before/after
    state and creates an audit log entry.

    This is a simplified decorator for common patterns. For complex
    multi-entity operations, use `audit_change` context manager directly.

    Args:
        action: Audit action identifier (e.g., "product.price_updated").
        entity_type: Override for entity type (auto-detected from model if None).
        tracked_fields: Specific fields to track (None = all columns).
    """

    def decorator(func: Callable) -> Callable:
        @functools.wraps(func)
        def wrapper(*args: Any, **kwargs: Any) -> Any:
            # Extract session and entity from kwargs if available
            session: Session | None = kwargs.get("session")
            instance = kwargs.get("instance")
            user_id = kwargs.get("user_id")
            ip_address = kwargs.get("ip_address")

            if session and instance:
                with audit_change(
                    session,
                    instance=instance,
                    action=action,
                    user_id=user_id,
                    ip_address=ip_address,
                    tracked_fields=tracked_fields,
                ):
                    result = func(*args, **kwargs)
                return result
            else:
                # If session/instance not available, just run the function
                return func(*args, **kwargs)

        return wrapper

    return decorator


def log_admin_action(
    session: Session,
    *,
    user_id: int,
    action: str,
    entity_type: str,
    entity_id: int,
    details: Dict[str, Any] | None = None,
    ip_address: Optional[str] = None,
) -> None:
    """
    Simple audit log for admin actions that don't have before/after state.

    Use for actions like "user logged in", "report exported", etc.
    """
    log_action(
        session,
        user_id=user_id,
        action=action,
        entity_type=entity_type,
        entity_id=entity_id,
        new_value=details,
        ip_address=ip_address,
    )
