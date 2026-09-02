"""
User model (SRS §17.2).

Holds both customer and admin/personnel accounts in a single table,
differentiated by `role_id`. Password is stored as a one-way hash
(bcrypt/argon2) — never plaintext.
"""

from datetime import datetime
from typing import Optional

from sqlalchemy import Column, DateTime
from sqlmodel import Field, Relationship

from app.models.base import TimestampMixin


class User(TimestampMixin, table=True):
    """Registered user — customer, admin, or personnel."""

    __tablename__ = "users"

    id: int | None = Field(default=None, primary_key=True)
    name: str = Field(max_length=150)
    email: str = Field(max_length=150, unique=True, index=True)
    phone: str | None = Field(default=None, max_length=20)
    password_hash: str = Field(max_length=255)
    role_id: int = Field(foreign_key="roles.id", index=True)
    is_active: bool = Field(default=True)
    newsletter_allowed: bool = Field(default=False)
    kvkk_accepted_at: datetime | None = Field(
        default=None,
        sa_column=Column(DateTime(timezone=True), nullable=True),
    )
    email_verified_at: datetime | None = Field(
        default=None,
        sa_column=Column(DateTime(timezone=True), nullable=True),
    )
    last_login_at: datetime | None = Field(
        default=None,
        sa_column=Column(DateTime(timezone=True), nullable=True),
    )

    failed_login_attempts: int = Field(default=0, ge=0)
    locked_until: datetime | None = Field(
        default=None,
        sa_column=Column(
            DateTime(timezone=True),
            nullable=True,
        ),
    )

    # Relationships
    role: "Role" = Relationship(back_populates="users")  # type: ignore[name-defined]  # noqa: F821
    addresses: list["Address"] = Relationship(back_populates="user")  # type: ignore[name-defined]  # noqa: F821
    orders: list["Order"] = Relationship(back_populates="user")  # type: ignore[name-defined]  # noqa: F821
    favorites: list["Favorite"] = Relationship(back_populates="user")  # type: ignore[name-defined]  # noqa: F821
    cart: Optional["Cart"] = Relationship(back_populates="user")  # type: ignore[name-defined]  # noqa: F821
