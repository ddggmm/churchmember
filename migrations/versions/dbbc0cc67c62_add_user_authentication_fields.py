"""Add user authentication fields

Revision ID: dbbc0cc67c62
Revises: bd079a60aa15
Create Date: 2024-09-25 13:12:05.765987

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'dbbc0cc67c62'
down_revision = 'bd079a60aa15'
branch_labels = None
depends_on = None


def upgrade():
    # 기존 컬럼 존재 여부 확인
    conn = op.get_bind()
    inspector = sa.inspect(conn)
    existing_columns = inspector.get_columns('member')
    existing_column_names = [col['name'] for col in existing_columns]

    with op.batch_alter_table('member', schema=None) as batch_op:
        # email 컬럼 추가 (존재하지 않는 경우에만)
        if 'email' not in existing_column_names:
            batch_op.add_column(sa.Column('email', sa.String(length=120), nullable=True))
        
        # password_hash 컬럼 추가 (존재하지 않는 경우에만)
        if 'password_hash' not in existing_column_names:
            batch_op.add_column(sa.Column('password_hash', sa.String(length=128), nullable=True))
        
        # role 컬럼 추가 (존재하지 않는 경우에만)
        if 'role' not in existing_column_names:
            batch_op.add_column(sa.Column('role', sa.String(length=20), nullable=True))
        
        # is_active 컬럼 추가 (존재하지 않는 경우에만)
        if 'is_active' not in existing_column_names:
            batch_op.add_column(sa.Column('is_active', sa.Boolean(), nullable=True))

    # 기존 회원들의 이메일 필드를 임시로 채웁니다.
    op.execute("UPDATE member SET email = 'temp_' || id || '@example.com' WHERE email IS NULL")

    # email 컬럼을 NOT NULL로 변경하고 유니크 제약 조건을 추가합니다.
    with op.batch_alter_table('member', schema=None) as batch_op:
        batch_op.alter_column('email', nullable=False)
        batch_op.create_unique_constraint('uq_member_email', ['email'])


def downgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    with op.batch_alter_table('member', schema=None) as batch_op:
        batch_op.drop_constraint('uq_member_email', type_='unique')
        batch_op.drop_column('is_active')
        batch_op.drop_column('role')
        batch_op.drop_column('password_hash')
        batch_op.drop_column('email')

    # ### end Alembic commands ###
