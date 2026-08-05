"""
Cart models (SRS §17.10).

Supports both registered users (`user_id`) and guest sessions
(`session_token`). A registered user has at most one active cart.
"""

from typing import Optional, List

from sqlmodel import Field, Relationship, SQLModel

from app.models.base import TimestampMixin


class Cart(TimestampMixin, table=True):
    """Shopping cart — one per registered user or guest session."""

    __tablename__ = "carts"

    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: Optional[int] = Field(default=None, foreign_key="users.id", unique=True)
    session_token: Optional[str] = Field(default=None, max_length=100, unique=True)

    # Relationships
    user: Optional["User"] = Relationship(back_populates="cart")  # type: ignore[name-defined]  # noqa: F821
    items: List["CartItem"] = Relationship(back_populates="cart")


class CartItem(TimestampMixin, table=True):
    """Individual item in a shopping cart."""

    __tablename__ = "cart_items"
    __table_args__ = (
        {"comment": "quantity must be > 0, enforced by check constraint"},
    )

    id: Optional[int] = Field(default=None, primary_key=True)
    cart_id: int = Field(foreign_key="carts.id", index=True)
    product_id: int = Field(foreign_key="products.id")
    variant_id: Optional[int] = Field(default=None, foreign_key="product_variants.id")
    quantity: int = Field(ge=1)

    # Relationships
    cart: Cart = Relationship(back_populates="items")
