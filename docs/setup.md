# Setup

🇹🇷 [Türkçe](setup.tr.md)

## Requirements

- Python 3.11+ and [uv](https://docs.astral.sh/uv/) (or pip)
- Node.js 18+ and npm
- Docker, or a PostgreSQL 16 server you can reach

## Environment variables

Copy `.env.example` to `.env`. The backend reads it with `python-dotenv`.

| Variable | Default | Notes |
| --- | --- | --- |
| `DATABASE_URL` | `postgresql://ecommerce_user:ecommerce_pass@localhost:5432/ecommerce_db` | Matches `docker-compose.yml`. Alembic uses it too. |
| `SECRET_KEY` | `change-me-in-production` | JWT signing key. **Set a long random value outside development.** |
| `JWT_ALGORITHM` | `HS256` | |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | `60` | |
| `LOGIN_MAX_FAILED_ATTEMPTS` | `5` | |
| `LOGIN_LOCK_MINUTES` | `15` | |
| `APP_NAME`, `APP_VERSION`, `APP_ENV` | | Shown in Swagger |
| `EMAIL_ENABLED` | `false` | Turn on email sending |
| `SMTP_HOST`, `SMTP_PORT`, `SMTP_USERNAME`, `SMTP_PASSWORD` | | |
| `SMTP_FROM_EMAIL`, `SMTP_FROM_NAME`, `SMTP_USE_TLS` | | |

Frontend (optional `.env` next to `package.json`):

| Variable | Default | Notes |
| --- | --- | --- |
| `VITE_API_BASE_URL` | `http://localhost:8000` | Origin only. The services already add `/api/...`, so don't put `/api` here. |

## Database

```bash
docker compose up -d db
uv run alembic upgrade head
```

Create a new migration after changing a model:

```bash
uv run alembic revision --autogenerate -m "describe the change"
uv run alembic upgrade head
```

## Seed data

```bash
uv run python -m app.seeds        # roles, permissions, demo admin / personnel / customer
uv run python seed_products.py    # demo categories, brands, products and variants
```

Both are safe to re-run: they skip rows that already exist and add anything new. Re-run `python -m app.seeds` after pulling changes that add permissions, so existing roles get them. Demo credentials are in `app/seeds/user_seed.py`; don't seed them on a public server.

## Run

```bash
uv run uvicorn app.main:app --reload     # API on :8000
npm run dev                              # frontend on :3000
```

Uploaded images go to `./uploads` (created on first upload) and are served at `/uploads/...`. Start the API from the repository root so that path resolves.

## Tests

```bash
uv run pytest
```

Tests use SQLite (`./test.db`) by default. To run them against PostgreSQL, set `TEST_DATABASE_URL`. Some behaviour, such as the audit-log rules and row locks, only exists on PostgreSQL.

| File | Covers |
| --- | --- |
| `test_auth_api.py` | Register, login, `/me`, lockout and unlock |
| `test_catalog_api.py` | Categories, published vs. hidden products, archiving |
| `test_customer_api.py` | Addresses, favorites, cart |
| `test_order_api.py`, `test_order_transaction.py` | Checkout totals, stock deduction and release, guest checkout, insufficient stock, status history |
| `test_state_machine.py` | Allowed and rejected order transitions |
| `test_rbac.py` | Seeded roles and permissions, personnel limits, every permission a router requires is seeded |
| `test_admin_api.py` | Dashboard access by role |
| `test_audit_log.py` | Audit entries for price, status and role changes |

Lint with `uv run ruff check .`.

## Production build

```bash
npm run build            # static files in dist/
```

Before deploying:

- set `SECRET_KEY` and a production `DATABASE_URL`,
- add your frontend domain to the CORS list in `app/main.py`,
- serve `dist/` with a web server that falls back to `index.html` for client-side routes,
- run several API workers only if you accept that the in-memory rate limit is per worker.

## Troubleshooting

| Symptom | Fix |
| --- | --- |
| `connection refused` on 5432 | `docker compose ps`. Is the `ecommerce_db` container healthy? |
| Requests go to `/api/api/...` | Remove `/api` from `VITE_API_BASE_URL`. |
| Browser shows a CORS error | Use port 3000 or 5173, or add your origin in `app/main.py`. |
| `403` on an admin page | The user's role lacks that permission. Check it under Roles. |
