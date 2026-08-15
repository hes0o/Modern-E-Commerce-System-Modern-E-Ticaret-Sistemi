"""
Enumeration types used across the database schema.

These are Python `enum.Enum` subclasses that map to PostgreSQL ENUM columns
via SQLAlchemy's `sa.Enum` type. They serve as the single source of truth
for constrained column values throughout the system.
"""

import enum


class ProductStatus(str, enum.Enum):
    """Product lifecycle status (SRS §5.2)."""

    ACTIVE = "active"
    INACTIVE = "inactive"
    DRAFT = "draft"
    PUBLISHED = "published"
    ARCHIVED = "archived"


class PaymentMethod(str, enum.Enum):
    """Payment methods available in MVP (SRS §7.4)."""

    COD = "cod"  # Kapıda Ödeme (Cash on Delivery)
    BANK_TRANSFER = "bank_transfer"  # Havale/EFT


class OrderStatus(str, enum.Enum):
    """
    Sipariş durumları — Order lifecycle status (SRS §7.3).

    Transitions are enforced by the OrderStateMachine service.
    """

    PENDING = "pending"
    CONFIRMED = "confirmed"
    PREPARING = "preparing"
    SHIPPED = "shipped"
    COMPLETED = "completed"
    CANCELLED = "cancelled"


class StockMovementType(str, enum.Enum):
    """
    Stock movement types (SRS §8.1).

    Each type determines whether stock is increased or decreased.
    """

    IN = "in"  # Stock entry (purchase, supplier delivery)
    OUT = "out"  # Manual stock exit (damage, count difference)
    RESERVED = "reserved"  # Order-triggered stock deduction
    RELEASED = "released"  # Cancellation-triggered stock return
    ADJUSTMENT = "adjustment"  # Physical count correction (±)
