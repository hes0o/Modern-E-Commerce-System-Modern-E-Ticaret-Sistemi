"""
Audit logging service (SRS §16.4, §17.18).

Provides the core `log_action` function and a convenience `audit_change`
context manager for automatically capturing before/after state.

Audit log records are append-only — the database enforces this with
PostgreSQL rules that prevent UPDATE and DELETE on the audit_logs table.
"""

import json
from contextlib import contextmanager
from typing import Any, Dict, List, Optional

from sqlmodel import Session, SQLModel

from app.models.audit import AuditLog


def log_action(
    session: Session,
    *,
    user_id: Optional[int],
    action: str,
    entity_type: str,
    entity_id: int,
    old_value: Optional[Dict[str, Any]] = None,
    new_value: Optional[Dict[str, Any]] = None,
    ip_address: Optional[str] = None,
) -> AuditLog:
    """
    Create an audit log entry for a system action.

    This is the low-level logging function. For automatic before/after
    capture, use the `audit_change` context manager instead.

    Args:
        session: Active database session.
        user_id: ID of the user performing the action (None for system actions).
        action: Action identifier (e.g., "product.price_updated").
        entity_type: The type of entity affected (e.g., "product", "order").
        entity_id: The primary key of the affected entity.
        old_value: State before the change (serialized to JSON).
        new_value: State after the change (serialized to JSON).
        ip_address: IP address of the request origin.

    Returns:
        The created AuditLog instance.
    """
    entry = AuditLog(
        user_id=user_id,
        action=action,
        entity_type=entity_type,
        entity_id=entity_id,
        old_value=old_value,
        new_value=new_value,
        ip_address=ip_address,
    )
    session.add(entry)
    return entry


def _model_to_dict(instance: SQLModel, fields: Optional[List[str]] = None) -> Dict[str, Any]:
    """
    Convert a SQLModel instance to a dict for audit logging.

    Only includes the specified fields if provided; otherwise includes
    all columns (excluding relationship attributes and internal fields).
    """
    if fields:
        return {field: getattr(instance, field, None) for field in fields}

    result = {}
    for column in instance.__class__.__table__.columns:
        value = getattr(instance, column.name, None)
        # Convert non-JSON-serializable types to strings
        if hasattr(value, "value"):  # Enum
            value = value.value
        elif hasattr(value, "isoformat"):  # datetime
            value = value.isoformat()
        result[column.name] = value
    return result


@contextmanager
def audit_change(
    session: Session,
    *,
    instance: SQLModel,
    action: str,
    user_id: Optional[int],
    ip_address: Optional[str] = None,
    tracked_fields: Optional[List[str]] = None,
):
    """
    Context manager that captures before/after state for audit logging.

    Usage:
        with audit_change(session, instance=product, action="product.price_updated",
                          user_id=admin.id, tracked_fields=["price", "discount_price"]):
            product.price = 99.99
            product.discount_price = 79.99
            session.add(product)

    The audit log entry is created when the context exits, capturing
    the old and new values of the tracked fields.

    Args:
        session: Active database session.
        instance: The SQLModel instance being modified.
        action: Action identifier for the audit log.
        user_id: ID of the user making the change.
        ip_address: IP address of the request.
        tracked_fields: Specific fields to track (None = all columns).
    """
    # Capture the "before" state
    old_value = _model_to_dict(instance, tracked_fields)

    yield instance

    # Capture the "after" state
    new_value = _model_to_dict(instance, tracked_fields)

    # Only log if something actually changed
    if old_value != new_value:
        log_action(
            session,
            user_id=user_id,
            action=action,
            entity_type=instance.__class__.__tablename__,
            entity_id=instance.id,
            old_value=old_value,
            new_value=new_value,
            ip_address=ip_address,
        )


def log_order_status_change(
    session: Session,
    *,
    order_id: int,
    old_status: str,
    new_status: str,
    user_id: Optional[int],
    ip_address: Optional[str] = None,
) -> AuditLog:
    """Convenience function for logging order status transitions."""
    return log_action(
        session,
        user_id=user_id,
        action="order.status_updated",
        entity_type="orders",
        entity_id=order_id,
        old_value={"status": old_status},
        new_value={"status": new_status},
        ip_address=ip_address,
    )


def log_price_change(
    session: Session,
    *,
    product_id: int,
    old_price: float,
    new_price: float,
    old_discount: Optional[float],
    new_discount: Optional[float],
    user_id: int,
    ip_address: Optional[str] = None,
) -> AuditLog:
    """Convenience function for logging product price changes."""
    return log_action(
        session,
        user_id=user_id,
        action="product.price_updated",
        entity_type="products",
        entity_id=product_id,
        old_value={"price": old_price, "discount_price": old_discount},
        new_value={"price": new_price, "discount_price": new_discount},
        ip_address=ip_address,
    )


def log_role_change(
    session: Session,
    *,
    target_user_id: int,
    old_role_id: int,
    new_role_id: int,
    changed_by_user_id: int,
    ip_address: Optional[str] = None,
) -> AuditLog:
    """Convenience function for logging user role assignments."""
    return log_action(
        session,
        user_id=changed_by_user_id,
        action="user.role_changed",
        entity_type="users",
        entity_id=target_user_id,
        old_value={"role_id": old_role_id},
        new_value={"role_id": new_role_id},
        ip_address=ip_address,
    )
