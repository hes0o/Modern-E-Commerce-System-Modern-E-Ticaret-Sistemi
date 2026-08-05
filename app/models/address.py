"""
Address model (SRS §17.4).

Users can store multiple shipping/billing addresses. One address
can be marked as `is_default`; the application layer ensures only
one default exists per user at any time.
"""

from typing import Optional

from sqlmodel import Field, Relationship, SQLModel

from app.models.base import TimestampMixin


class Address(TimestampMixin, table=True):
    """User delivery/billing address."""

    __tablename__ = "addresses"

    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: int = Field(foreign_key="users.id", index=True)
    title: str = Field(max_length=100)  # e.g., "Ev", "İş"
    recipient_name: str = Field(max_length=150)
    phone: str = Field(max_length=20)
    city: str = Field(max_length=100)  # İl
    district: str = Field(max_length=100)  # İlçe
    full_address: str  # TEXT — open address
    postal_code: Optional[str] = Field(default=None, max_length=10)
    is_default: bool = Field(default=False)

    # Relationships
    user: "User" = Relationship(back_populates="addresses")  # type: ignore[name-defined]  # noqa: F821
