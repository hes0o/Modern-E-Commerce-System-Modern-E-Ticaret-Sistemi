"""
Favorite model (SRS §17.11).

Links registered users to products they've wishlisted.
A unique constraint on (user_id, product_id) prevents duplicates.
"""

from typing import Optional

from sqlalchemy import UniqueConstraint
from sqlmodel import Field, Relationship, SQLModel

from app.models.base import TimestampMixin


class Favorite(TimestampMixin, table=True):
    """User ↔ Product wishlist entry."""

    __tablename__ = "favorites"
    __table_args__ = (
        UniqueConstraint("user_id", "product_id", name="uq_favorites_user_product"),
    )

    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: int = Field(foreign_key="users.id", index=True)
    product_id: int = Field(foreign_key="products.id", index=True)

    # Relationships
    user: "User" = Relationship(back_populates="favorites")  # type: ignore[name-defined]  # noqa: F821
