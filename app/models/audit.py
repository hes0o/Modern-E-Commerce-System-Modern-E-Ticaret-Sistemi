"""
Audit log model (SRS §17.18).

Append-only table for recording critical system changes. This model
intentionally omits `updated_at` — audit records must never be modified.

Database-level protection (PostgreSQL rules preventing UPDATE/DELETE)
is applied via migration 002_audit_log_protection.
"""

from typing import Optional

from datetime import datetime, timezone

from sqlalchemy import Column, DateTime, Index, Text, func
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.types import JSON
from sqlmodel import Field, SQLModel


def utc_now() -> datetime:
    return datetime.now(timezone.utc)


class AuditLog(SQLModel, table=True):
    """
    Immutable audit trail entry (SRS §17.18).

    Records who did what, to which entity, with before/after values.
    No `updated_at` field — this table is append-only by design.
    """

    __tablename__ = "audit_logs"
    __table_args__ = (
        Index("ix_audit_logs_entity", "entity_type", "entity_id"),
        Index("ix_audit_logs_user_action", "user_id", "action"),
    )

    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: Optional[int] = Field(default=None, foreign_key="users.id", index=True)
    action: str = Field(max_length=100)  # e.g., "product.price_updated"
    entity_type: str = Field(max_length=50)  # e.g., "product", "order"
    entity_id: int
    old_value: Optional[dict] = Field(default=None, sa_column=Column(JSON().with_variant(JSONB, "postgresql"), nullable=True))
    new_value: Optional[dict] = Field(default=None, sa_column=Column(JSON().with_variant(JSONB, "postgresql"), nullable=True))
    ip_address: Optional[str] = Field(default=None, max_length=45)

    # Only created_at — no updated_at for append-only semantics
    created_at: datetime = Field(
        default_factory=utc_now,
        sa_column=Column(
            DateTime(timezone=True),
            server_default=func.now(),
            nullable=False,
        ),
    )
