"""
Notification model (SRS §17.16).

In-panel notifications for admin/personnel. When `recipient_user_id`
is NULL, the notification targets all admin users.
"""

from typing import Optional

from sqlalchemy import Column, Text
from sqlmodel import Field, SQLModel

from app.models.base import TimestampMixin


class Notification(TimestampMixin, table=True):
    """Panel notification (new order, low stock, new member, etc.)."""

    __tablename__ = "notifications"

    id: Optional[int] = Field(default=None, primary_key=True)
    type: str = Field(max_length=50)  # e.g., "new_order", "low_stock"
    title: str = Field(max_length=200)
    message: str = Field(sa_column=Column(Text, nullable=False))
    related_entity_type: Optional[str] = Field(default=None, max_length=50)
    related_entity_id: Optional[int] = Field(default=None)
    is_read: bool = Field(default=False)
    recipient_user_id: Optional[int] = Field(
        default=None, foreign_key="users.id", index=True
    )
