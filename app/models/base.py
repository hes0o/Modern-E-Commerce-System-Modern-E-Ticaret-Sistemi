"""Shared timestamp fields for database models."""

from datetime import timezone, datetime

from sqlmodel import Field, SQLModel


def utc_now() -> datetime:
    """Return the current timezone.utc timestamp."""
    return datetime.now(timezone.utc)


class TimestampMixin(SQLModel):
    """Add creation and update timestamps to database models."""

    created_at: datetime = Field(
        default_factory=utc_now,
    )
    updated_at: datetime = Field(
        default_factory=utc_now,
        sa_column_kwargs={
            "onupdate": utc_now,
        },
    )