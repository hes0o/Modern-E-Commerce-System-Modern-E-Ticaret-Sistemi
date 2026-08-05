"""
User model (SRS §17.2).

Holds both customer and admin/personnel accounts in a single table,
differentiated by `role_id`. Password is stored as a one-way hash
(bcrypt/argon2) — never plaintext.
"""

from typing import Optional, List

from datetime import datetime

from sqlalchemy import Column, DateTime
from sqlmodel import Field, Relationship, SQLModel

from app.models.base import TimestampMixin


class User(TimestampMixin, table=True):
    """Registered user — customer, admin, or personnel."""

    __tablename__ = "users"

    id: Optional[int] = Field(default=None, primary_key=True)
    name: str = Field(max_length=150)
    email: str = Field(max_length=150, unique=True, index=True)
    phone: Optional[str] = Field(default=None, max_length=20)
    password_hash: str = Field(max_length=255)
    role_id: int = Field(foreign_key="roles.id", index=True)
    is_active: bool = Field(default=True)
    newsletter_allowed: bool = Field(default=False)
    kvkk_accepted_at: Optional[datetime] = Field(
        default=None,
        sa_column=Column(DateTime(timezone=True), nullable=True),
    )
    email_verified_at: Optional[datetime] = Field(
        default=None,
        sa_column=Column(DateTime(timezone=True), nullable=True),
    )
    last_login_at: Optional[datetime] = Field(
        default=None,
        sa_column=Column(DateTime(timezone=True), nullable=True),
    )

    # Relationships
    role: "Role" = Relationship(back_populates="users")  # type: ignore[name-defined]  # noqa: F821
    addresses: List["Address"] = Relationship(back_populates="user")  # type: ignore[name-defined]  # noqa: F821
    orders: List["Order"] = Relationship(back_populates="user")  # type: ignore[name-defined]  # noqa: F821
    favorites: List["Favorite"] = Relationship(back_populates="user")  # type: ignore[name-defined]  # noqa: F821
    cart: Optional["Cart"] = Relationship(back_populates="user")  # type: ignore[name-defined]  # noqa: F821
