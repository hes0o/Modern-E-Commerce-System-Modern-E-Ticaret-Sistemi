"""normalize product status values

Revision ID: ef6ff6f9c9b1
Revises: 05c839eed59d
Create Date: 2026-08-25 22:04:44.387058
"""

from collections.abc import Sequence

from alembic import op

# revision identifiers, used by Alembic.
revision: str = 'ef6ff6f9c9b1'
down_revision: str | None = '05c839eed59d'
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    op.execute(
        "ALTER TYPE productstatus "
        "RENAME VALUE 'DRAFT' TO 'draft'"
    )
    op.execute(
        "ALTER TYPE productstatus "
        "RENAME VALUE 'PUBLISHED' TO 'published'"
    )
    op.execute(
        "ALTER TYPE productstatus "
        "RENAME VALUE 'ARCHIVED' TO 'archived'"
    )
    op.execute(
        "ALTER TYPE productstatus "
        "ADD VALUE IF NOT EXISTS 'inactive' BEFORE 'draft'"
    )
    op.execute(
        "ALTER TYPE productstatus "
        "ADD VALUE IF NOT EXISTS 'active' BEFORE 'inactive'"
    )


def downgrade() -> None:
    op.execute(
        "UPDATE products SET status = 'published' "
        "WHERE status = 'active'"
    )
    op.execute(
        "UPDATE products SET status = 'draft' "
        "WHERE status = 'inactive'"
    )
    op.execute(
        "ALTER TYPE productstatus "
        "RENAME TO productstatus_normalized"
    )
    op.execute(
        "CREATE TYPE productstatus AS ENUM "
        "('DRAFT', 'PUBLISHED', 'ARCHIVED')"
    )
    op.execute(
        """
        ALTER TABLE products
        ALTER COLUMN status TYPE productstatus
        USING (
            CASE status::text
                WHEN 'draft' THEN 'DRAFT'
                WHEN 'published' THEN 'PUBLISHED'
                WHEN 'archived' THEN 'ARCHIVED'
            END
        )::productstatus
        """
    )
    op.execute("DROP TYPE productstatus_normalized")