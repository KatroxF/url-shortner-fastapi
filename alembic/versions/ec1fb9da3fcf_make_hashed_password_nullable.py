"""make hashed_password nullable

Revision ID: ec1fb9da3fcf
Revises: 3713775f9c19
Create Date: 2026-09-23 13:36:26.551889

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'ec1fb9da3fcf'
down_revision: Union[str, Sequence[str], None] = '3713775f9c19'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    pass


def downgrade() -> None:
    """Downgrade schema."""
    pass
