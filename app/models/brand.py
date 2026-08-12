"""
Brand model (SRS §17.6).

Simple lookup table for product brands with optional logo.
"""

from typing import Optional, List

from sqlmodel import Field, Relationship, SQLModel

from app.models.base import TimestampMixin


class Brand(TimestampMixin, table=True):
    """Product brand definition."""

    __tablename__ = "brands"

    id: Optional[int] = Field(default=None, primary_key=True)
    name: str = Field(max_length=150, unique=True, index=True)
    logo_path: Optional[str] = Field(default=None, max_length=255)
    is_active: bool = Field(default=True)

    category_id: Optional[int] = Field(default=None, foreign_key="categories.id", index=True)

    # Relationships
    category: Optional["Category"] = Relationship(back_populates="brands")  # type: ignore[name-defined]  # noqa: F821
    products: List["Product"] = Relationship(back_populates="brand")  # type: ignore[name-defined]  # noqa: F821
