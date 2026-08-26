"""Add category_id to brands.

Revision ID: 05c839eed59d
Revises: 004
Create Date: 2026-08-17 11:48:24.675221
"""

from collections.abc import Sequence

import sqlalchemy as sa
from alembic import op

revision: str = "05c839eed59d"
down_revision: str | None = "004"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    op.add_column(
        "brands",
        sa.Column(
            "category_id",
            sa.Integer(),
            nullable=True,
        ),
    )
    op.create_index(
        "ix_brands_category_id",
        "brands",
        ["category_id"],
        unique=False,
    )
    op.create_foreign_key(
        "brands_category_id_fkey",
        "brands",
        "categories",
        ["category_id"],
        ["id"],
    )


def downgrade() -> None:
    op.drop_constraint(
        "brands_category_id_fkey",
        "brands",
        type_="foreignkey",
    )
    op.drop_index(
        "ix_brands_category_id",
        table_name="brands",
    )
    op.drop_column(
        "brands",
        "category_id",
    )