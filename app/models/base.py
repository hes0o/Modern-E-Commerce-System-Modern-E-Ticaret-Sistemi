"""
Base model utilities — shared timestamp fields and mixins.

Every table in the system inherits `created_at` and `updated_at` columns
through the `TimestampMixin`. The `AuditLog` table overrides this to
exclude `updated_at` (append-only).

Note on SQLModel + Column sharing:
SQLModel/SQLAlchemy does not allow a single `Column` object to be shared
across multiple models. We use `sa_column_kwargs` to avoid this, but
must avoid passing `type_` alongside SQLModel's auto-detection.
"""

from datetime import datetime, timezone

from sqlmodel import SQLModel


def utc_now() -> datetime:
    """Return the current UTC timestamp."""
    return datetime.now(timezone.utc)


class TimestampMixin(SQLModel):
    """
    Mixin that adds created_at and updated_at to any model.

    These fields are declared as plain SQLModel fields. The database-level
    server_default is set via the Alembic migration, not in the Python model,
    to avoid Column-sharing issues with SQLModel inheritance.
    """

    created_at: datetime = utc_now()
    updated_at: datetime = utc_now()
