"""
Stock movement model (SRS §17.15).

Records every stock change with before/after values for full traceability.
Used by the transactional order service and manual admin stock operations.
"""

from typing import Optional

from sqlalchemy import Column, Index, Text
from sqlmodel import Field, Relationship, SQLModel

from app.models.base import TimestampMixin
from app.models.enums import StockMovementType


class StockMovement(TimestampMixin, table=True):
    """
    Individual stock movement record (SRS §17.15).

    Every stock change — whether from orders, manual adjustments, or
    inventory counts — creates a movement record for auditability.
    """

    __tablename__ = "stock_movements"
    __table_args__ = (
        Index("ix_stock_movements_product_variant", "product_id", "variant_id"),
    )

    id: Optional[int] = Field(default=None, primary_key=True)
    product_id: int = Field(foreign_key="products.id", index=True)
    variant_id: Optional[int] = Field(default=None, foreign_key="product_variants.id")
    movement_type: StockMovementType
    quantity: int  # Always positive; direction determined by movement_type
    stock_before: int
    stock_after: int
    related_order_id: Optional[int] = Field(default=None, foreign_key="orders.id")
    created_by_user_id: Optional[int] = Field(default=None, foreign_key="users.id")
    note: Optional[str] = Field(default=None, sa_column=Column(Text, nullable=True))
