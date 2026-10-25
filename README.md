# 🛍️ Modern E-Commerce System

> Full-stack e-commerce platform: a customer storefront and an admin panel on top of a FastAPI + PostgreSQL backend, with role-based permissions, transactional stock handling, an order state machine and a tamper-proof audit log.

🇹🇷 [Türkçe README](README.tr.md) · 📚 [Documentation](docs/)

---

## Features

**Storefront**
- Product catalog with categories, brands, variants and image galleries; search, category/brand/price filters and sorting.
- Cart for guests (session token) and signed-in customers.
- Checkout for guests or customers, with saved or typed-in addresses, cash on delivery or bank transfer, and required distance-sales contract and KVKK consent.
- Customer account: profile, password, order history and cancellation, favorites, address book.

**Admin panel** (`/admin`)
- Dashboard with sales charts and top products.
- Products, variants, images, categories and brands.
- Orders by status (pending, preparing, shipping, delivered, cancelled), status changes, admin notes, tracking numbers, cargo labels with barcodes.
- Stock levels, manual stock movements and low-stock notifications.
- Staff users, roles and permissions; system settings; sales reports with CSV export.

**Backend**
- Role-based access control: `admin`, `personnel` and `customer` roles over 30+ fine-grained permissions.
- Orders are created in one database transaction with row locks on stock (`SELECT … FOR UPDATE`), so two buyers can't oversell the last item.
- Order status changes are validated by a state machine.
- Append-only `audit_logs` table, enforced by PostgreSQL rules.
- Argon2 password hashing, JWT auth, login lockout after repeated failures, per-IP rate limiting (120 requests/min) and security headers.

## Tech stack

| Layer | Technology |
| --- | --- |
| Backend | Python 3.11+, FastAPI, SQLModel / SQLAlchemy 2, Alembic, Pydantic 2 |
| Auth & security | PyJWT, pwdlib (Argon2), custom rate-limit and security-header middleware |
| Database | PostgreSQL 16 |
| Frontend | React 18, Vite 5, React Router 6, Tailwind CSS 3, Axios, Recharts, lucide-react |
| Testing | pytest, httpx / FastAPI TestClient |
| Tooling | uv, Ruff, Docker Compose (database) |

## Quickstart

### 1. Database

```bash
git clone https://github.com/hes0o/Modern-E-Commerce-System-Modern-E-Ticaret-Sistemi.git
cd Modern-E-Commerce-System-Modern-E-Ticaret-Sistemi

cp .env.example .env
docker compose up -d db          # PostgreSQL 16 on localhost:5432
```

`docker-compose.yml` only runs the database. The API and the frontend run on your machine.

### 2. Backend

```bash
uv sync --extra dev              # or: python -m venv .venv && pip install -e ".[dev]"
uv run alembic upgrade head      # create tables
uv run python -m app.seeds       # roles, permissions and demo users
uv run python seed_products.py   # optional: demo categories, brands, products

uv run uvicorn app.main:app --reload
```

API: http://localhost:8000/api · Swagger: http://localhost:8000/docs · Health: http://localhost:8000/api/health

### 3. Frontend

```bash
npm install
npm run dev                      # http://localhost:3000
```

The frontend calls `http://localhost:8000` by default. Set `VITE_API_BASE_URL` (without `/api`) in a frontend `.env` to point it elsewhere.

- Storefront: http://localhost:3000
- Admin panel: http://localhost:3000/admin

The demo accounts created by `python -m app.seeds` are listed in `app/seeds/user_seed.py`. Change or remove them before going live.

Full setup, tests and troubleshooting: [docs/setup.md](docs/setup.md).

## Documentation

| Document | Contents |
| --- | --- |
| [docs/architecture.md](docs/architecture.md) | Layers, data model, RBAC, order and stock flow, security |
| [docs/api.md](docs/api.md) | Every endpoint, response format, auth, error codes |
| [docs/setup.md](docs/setup.md) | Environment variables, migrations, seeds, tests |

## Project structure

```
app/
├── core/          config, JWT + password hashing, dependencies, rate limit, security headers, errors
├── models/        SQLModel tables
├── schemas/       request/response models
├── repositories/  database queries
├── services/      business logic (orders, stock, RBAC, audit, uploads, …)
├── routers/       FastAPI routes, one file per module
├── middleware/    @audited decorator
├── migrations/    Alembic revisions
└── seeds/         roles, permissions, demo users
src/
├── pages/store/   storefront pages
├── pages/…        admin pages (dashboard, products, orders, stock, users, roles, reports, settings)
├── services/      Axios API clients
├── context/       auth, cart, orders
└── routes/        router and route guards
tests/             pytest suite (auth, catalog, cart/orders, RBAC, state machine, audit log)
```

## License

No license file yet. All rights reserved by the authors unless stated otherwise.
