"""Shared timestamp fields for database models."""

from datetime import UTC, datetime

from sqlmodel import Field, SQLModel


def utc_now() -> datetime:
    """Return the current UTC timestamp."""
    return datetime.now(UTC)


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