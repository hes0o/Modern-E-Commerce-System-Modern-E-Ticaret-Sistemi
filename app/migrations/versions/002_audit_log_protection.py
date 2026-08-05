"""
Audit log protection migration.

Applies PostgreSQL rules that prevent UPDATE and DELETE on the audit_logs
table, enforcing append-only semantics at the database level.

This is a critical security measure — even if the application layer is
compromised, audit records cannot be tampered with.

Revision ID: 002
Revises: 001
"""

from typing import Sequence, Union

from alembic import op

revision: str = "002"
down_revision: Union[str, None] = "001"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Apply append-only protection rules to audit_logs table."""

    # Prevent any UPDATE operations on audit_logs
    op.execute(
        """
        CREATE RULE prevent_audit_update AS
            ON UPDATE TO audit_logs
            DO INSTEAD NOTHING;
        """
    )

    # Prevent any DELETE operations on audit_logs
    op.execute(
        """
        CREATE RULE prevent_audit_delete AS
            ON DELETE TO audit_logs
            DO INSTEAD NOTHING;
        """
    )

    # Add a comment to the table documenting the protection
    op.execute(
        """
        COMMENT ON TABLE audit_logs IS
            'Append-only audit trail. UPDATE and DELETE are blocked by PostgreSQL rules. '
            'Records are immutable once created.';
        """
    )


def downgrade() -> None:
    """Remove append-only protection (for development/testing only)."""

    op.execute("DROP RULE IF EXISTS prevent_audit_update ON audit_logs;")
    op.execute("DROP RULE IF EXISTS prevent_audit_delete ON audit_logs;")
    op.execute("COMMENT ON TABLE audit_logs IS NULL;")
