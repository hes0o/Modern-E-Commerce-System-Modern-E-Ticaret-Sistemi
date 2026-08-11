"""Add product supplier field.

Revision ID: 004
Revises: 003
Create Date: 2026-08-11
"""

from collections.abc import Sequence

import sqlalchemy as sa
from alembic import op

revision: str = "004"
down_revision: str | None = "003"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    op.add_column(
        "products",
        sa.Column(
            "supplier",
            sa.String(length=150),
            nullable=True,
        ),
    )
    op.create_index(
        "ix_products_supplier",
        "products",
        ["supplier"],
        unique=False,
    )


def downgrade() -> None:
    op.drop_index(
        "ix_products_supplier",
        table_name="products",
    )
    op.drop_column(
        "products",
        "supplier",
    )