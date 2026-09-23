"""make short_code nullable

Revision ID: 078e8124cb91
Revises: 0e40baefda8c
Create Date: 2026-09-23 19:51:15.987310

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '078e8124cb91'
down_revision: Union[str, Sequence[str], None] = '0e40baefda8c'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    pass


def downgrade() -> None:
    """Downgrade schema."""
    pass
