from typing import Optional, Union, Any
"""Add user consent fields.

Revision ID: 8b6cc373839d
Revises: 002
Create Date: 2026-08-05
"""

from collections.abc import Sequence

import sqlalchemy as sa
from alembic import op

revision: str = "8b6cc373839d"
down_revision: Optional[str] = "002"
branch_labels: Union[str, Optional[Sequence[str]]] = None
depends_on: Union[str, Optional[Sequence[str]]] = None


def upgrade() -> None:
    op.add_column(
        "users",
        sa.Column(
            "newsletter_allowed",
            sa.Boolean(),
            nullable=False,
            server_default=sa.false(),
        ),
    )
    op.add_column(
        "users",
        sa.Column(
            "kvkk_accepted_at",
            sa.DateTime(timezone=True),
            nullable=True,
        ),
    )


def downgrade() -> None:
    op.drop_column("users", "kvkk_accepted_at")
    op.drop_column("users", "newsletter_allowed")