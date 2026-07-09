# Alembic migrations

- Run `alembic init alembic` to set up migrations.
- Configure `alembic.ini` with your `DATABASE_URL`.
- Create initial migration: `alembic revision --autogenerate -m 'initial'`.
- Apply: `alembic upgrade head`.

Point `alembic/env.py` at `Base.metadata` from `db.models` so autogenerate sees these tables.
