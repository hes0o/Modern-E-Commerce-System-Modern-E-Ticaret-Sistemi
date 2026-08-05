"""
Setting model (SRS §17.17).

Key-value store for system configuration. Sensitive values
(e.g., SMTP password) should be encrypted at the application
layer before storage.
"""

from typing import Optional

from sqlalchemy import Column, Text
from sqlmodel import Field, SQLModel

from app.models.base import TimestampMixin


class Setting(TimestampMixin, table=True):
    """System configuration key-value pair."""

    __tablename__ = "settings"

    id: Optional[int] = Field(default=None, primary_key=True)
    key: str = Field(max_length=100, unique=True, index=True)
    value: Optional[str] = Field(default=None, sa_column=Column(Text, nullable=True))
    group: Optional[str] = Field(default=None, max_length=50, index=True)
