"""
Order models (SRS §17.12, §17.13, §17.14).

Three related models:
- `Order`              — master order record with address snapshots and totals
- `OrderItem`          — individual line items with price/name snapshots
- `OrderStatusHistory` — immutable log of every status transition
"""

from typing import Optional, List

from sqlalchemy import Numeric, Column, Index, Text
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.types import JSON
from sqlmodel import Field, Relationship, SQLModel

from app.models.base import TimestampMixin
from app.models.enums import OrderStatus, PaymentMethod


class Order(TimestampMixin, table=True):
    """
    Master order record (SRS §17.12).

    Address and price data are snapshotted at order creation time to
    preserve historical accuracy even if the source records change later.
    """

    __tablename__ = "orders"
    __table_args__ = (
        Index("ix_orders_user_id", "user_id"),
        Index("ix_orders_status", "status"),
    )

    id: Optional[int] = Field(default=None, primary_key=True)
    order_number: str = Field(max_length=30, unique=True, index=True)
    user_id: Optional[int] = Field(default=None, foreign_key="users.id")

    # Guest order fields (used when user_id is NULL)
    guest_name: Optional[str] = Field(default=None, max_length=150)
    guest_email: Optional[str] = Field(default=None, max_length=150)
    guest_phone: Optional[str] = Field(default=None, max_length=20)

    # Address snapshots — immutable copies at order time
    shipping_address_snapshot: dict = Field(sa_column=Column(JSON().with_variant(JSONB, "postgresql"), nullable=False))
    billing_address_snapshot: Optional[dict] = Field(
        default=None, sa_column=Column(JSON().with_variant(JSONB, "postgresql"), nullable=True)
    )

    # Payment & status
    payment_method: PaymentMethod
    status: OrderStatus = Field(default=OrderStatus.PENDING)

    # Financial totals
    subtotal: float = Field(sa_column=Column(Numeric(10, 2)))
    discount_total: Optional[float] = Field(
        default=None, sa_column=Column(Numeric(10, 2))
    )
    vat_total: float = Field(sa_column=Column(Numeric(10, 2)))
    grand_total: float = Field(sa_column=Column(Numeric(10, 2)))

    # Notes
    customer_note: Optional[str] = Field(default=None, sa_column=Column(Text, nullable=True))
    admin_note: Optional[str] = Field(default=None, sa_column=Column(Text, nullable=True))

    # Shipping
    shipping_tracking_number: Optional[str] = Field(default=None, max_length=60)

    # Legal
    contract_version_accepted: str = Field(max_length=20)

    # Relationships
    user: Optional["User"] = Relationship(back_populates="orders")  # type: ignore[name-defined]  # noqa: F821
    items: List["OrderItem"] = Relationship(back_populates="order")
    status_history: List["OrderStatusHistory"] = Relationship(back_populates="order")


class OrderItem(TimestampMixin, table=True):
    """
    Individual line item within an order (SRS §17.13).

    Stores snapshot values (product name, unit price) so the order
    record remains accurate even if the product is later modified.
    """

    __tablename__ = "order_items"
    __table_args__ = (
        Index("ix_order_items_order_id", "order_id"),
    )

    id: Optional[int] = Field(default=None, primary_key=True)
    order_id: int = Field(foreign_key="orders.id")
    product_id: int = Field(foreign_key="products.id")
    variant_id: Optional[int] = Field(default=None, foreign_key="product_variants.id")
    product_name_snapshot: str = Field(max_length=200)
    unit_price: float = Field(sa_column=Column(Numeric(10, 2)))
    quantity: int = Field(ge=1)
    line_total: float = Field(sa_column=Column(Numeric(10, 2)))

    # Relationships
    order: Order = Relationship(back_populates="items")


class OrderStatusHistory(TimestampMixin, table=True):
    """
    Immutable log of order status transitions (SRS §17.14).

    Every status change is recorded with who made the change and when.
    This provides a complete audit trail for order lifecycle.
    """

    __tablename__ = "order_status_history"

    id: Optional[int] = Field(default=None, primary_key=True)
    order_id: int = Field(foreign_key="orders.id", index=True)
    old_status: Optional[str] = Field(default=None, max_length=30)
    new_status: str = Field(max_length=30)
    changed_by_user_id: Optional[int] = Field(default=None, foreign_key="users.id")
    note: Optional[str] = Field(default=None, sa_column=Column(Text, nullable=True))

    # Relationships
    order: Order = Relationship(back_populates="status_history")
