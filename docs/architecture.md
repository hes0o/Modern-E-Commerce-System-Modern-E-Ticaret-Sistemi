# Architecture

🇹🇷 [Türkçe](architecture.tr.md)

## Overview

```
React SPA (Vite, :3000)
  ├── Storefront   /, /shop, /cart, /checkout, /account/…
  └── Admin panel  /admin/…
        │  Axios, JWT in Authorization, guest X-Session-Token
        ▼
FastAPI (:8000)
  middleware: SecurityHeaders → RateLimit (120/min/IP) → CORS
  routers → services → repositories → SQLModel
        │
        ▼
PostgreSQL 16 (Alembic migrations)        uploads/ (served at /uploads)
```

## Backend layers

| Layer | Folder | Responsibility |
| --- | --- | --- |
| Routers | `app/routers/` | HTTP routes, request validation, auth dependencies, the `{success, data, message, errors}` envelope |
| Services | `app/services/` | Business rules: checkout, stock, order state machine, RBAC, audit, file storage, reports |
| Repositories | `app/repositories/` | Database queries |
| Models | `app/models/` | SQLModel table classes and enums |
| Schemas | `app/schemas/` | Pydantic request and response models |
| Core | `app/core/` | Settings, JWT + Argon2, dependencies (`get_current_user`, `require_permission`), middleware, error handlers |

Errors raised as `AppError` subclasses are turned into the standard envelope by `app/core/handlers.py`; validation errors and unexpected exceptions get the same treatment.

## Data model

| Area | Tables |
| --- | --- |
| Users and access | `users`, `roles`, `permissions`, `role_permission` |
| Catalog | `categories`, `brands`, `products`, `product_variants`, `product_images` |
| Shopping | `carts`, `cart_items`, `favorites`, `addresses` |
| Orders | `orders`, `order_items`, `order_status_history` |
| Operations | `stock_movements`, `notifications`, `settings`, `audit_logs` |

Migrations live in `app/migrations/versions/` (initial schema, audit log protection, login lockout fields, product supplier, brand category, user consent fields, product status normalization).

## Roles and permissions

Seeded by `app/seeds/rbac_seed.py`:

| Role | Permissions |
| --- | --- |
| `admin` | All permissions |
| `personnel` | Read products, categories, brands, customers and the dashboard; view and progress orders (status, notes, tracking); read and update stock; read and update notifications |
| `customer` | None in the admin API. Customers use the `/api/auth/me`, cart, address, favorite and `/api/orders/me` routes. |

Permission names follow `area.action`: `product.create`, `order.update_status`, `stock.update`, `report.export`, `user.assign_role`, `audit.read` and so on. Routes declare what they need with `require_permission("…")`; listing more than one means the user needs all of them. Admins can change which permissions each role has via `/api/admin/rbac`.

## Checkout and stock

`app/services/order_service.py` creates an order inside one database transaction:

1. Load the cart (by user, or by `X-Session-Token` for guests).
2. For every item, lock the stock row with `SELECT … FOR UPDATE`, check there is enough, deduct it, and write a `reserved` stock movement.
3. If any item is short, roll everything back and return `409` listing the conflicts.
4. Otherwise create the order and its items, empty the cart, and raise low-stock notifications where stock fell below the threshold.

Cancelling an order returns its stock with a `released` movement. Staff can also record `in`, `out` and `adjustment` movements from the stock page.

## Order state machine

`app/services/order_state_machine.py` allows only these transitions:

```
pending ──► confirmed ──► preparing ──► shipped ──► completed
   │            │             │
   └────────────┴─────────────┴──► cancelled
```

`completed` and `cancelled` are final. Every change is written to `order_status_history`.

## Security

- **Passwords:** Argon2 via `pwdlib`.
- **Tokens:** HS256 JWTs signed with `SECRET_KEY`, 60-minute default lifetime.
- **Brute force:** account lock after 5 failed logins for 15 minutes (configurable).
- **Rate limit:** 120 requests per minute per client IP, in memory (`app/core/rate_limit.py`). It resets on restart and is per process.
- **Headers:** `X-Content-Type-Options`, `X-Frame-Options: DENY`, `Referrer-Policy`, `Permissions-Policy`, HSTS, and a CSP on API responses.
- **Audit log:** `audit_logs` is append-only. Migration `002` adds PostgreSQL rules that turn `UPDATE` and `DELETE` on it into no-ops, so even a compromised app can't rewrite history. Handlers can opt in with the `@audited(action=…, tracked_fields=[…])` decorator in `app/middleware/audit_middleware.py`.
- **Uploads:** content type checked (JPEG, PNG, WEBP), 5 MB and 25-megapixel limits, stored under `uploads/`.
- **CORS:** only `localhost` / `127.0.0.1` on ports 3000–3002 and 5173–5174. Add your domain in `app/main.py` before deploying.

## Frontend

| Folder | Contents |
| --- | --- |
| `src/routes/` | `AppRouter.jsx`, `ProtectedRoute` (staff), `CustomerRoute` (customers) |
| `src/layouts/` | Storefront layout and navbar; admin layout and sidebar |
| `src/pages/store/` | Home, shop, product detail, cart, checkout, customer login, account pages |
| `src/pages/…` | Admin: dashboard, products, categories and brands, orders by status, stock, users, roles, reports, settings, notifications, profile |
| `src/services/` | One Axios client per area, sharing `api.js` (adds the JWT or guest session token) |
| `src/context/` | `AuthContext`, `CartContext`, `OrderContext` |
| `src/components/` | Charts (Recharts), data table, modals, image uploader, product form and variant builder |

The JWT is kept in `localStorage` (`shop_admin_user`), and the guest cart token in `shop_session_token`.
