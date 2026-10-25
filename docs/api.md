# API reference

🇹🇷 [Türkçe](api.tr.md)

- Base URL: `http://localhost:8000` (every route starts with `/api`)
- Swagger: `http://localhost:8000/docs` · OpenAPI JSON: `http://localhost:8000/openapi.json`
- Health: `GET /api/health`

## Response envelope

Every JSON endpoint answers in the same shape:

```json
{
  "success": true,
  "data": {},
  "message": "İşlem başarılı.",
  "errors": []
}
```

With Axios the payload is at `response.data.data`.

## Authentication

`POST /api/auth/login` with `{"email": "...", "password": "..."}` returns a JWT in `data.access_token`. Send it on protected routes:

```http
Authorization: Bearer <access_token>
```

Tokens expire after `ACCESS_TOKEN_EXPIRE_MINUTES` (default 60). After `LOGIN_MAX_FAILED_ATTEMPTS` wrong passwords (default 5) the account is locked for `LOGIN_LOCK_MINUTES` (default 15).

Roles are `admin`, `personnel` and `customer`. Admin routes check named permissions (for example `order.update_status`); see [architecture.md](architecture.md#roles-and-permissions).

### Guest cart and checkout

The first cart request without a token creates a guest cart and returns `data.session_token`. Store it and send it on later cart and checkout requests:

```http
X-Session-Token: <session_token>
```

Don't generate this token on the client.

## Auth and profile

| Method | Endpoint | Auth | Description |
| --- | --- | --- | --- |
| POST | `/api/auth/register` | — | Create a customer account |
| POST | `/api/auth/login` | — | Log in, get a JWT |
| GET | `/api/auth/me` | user | Current user |
| PATCH | `/api/auth/me` | user | Update `name`, `email`, `phone`, `newsletter_allowed` |
| PATCH | `/api/auth/me/password` | user | Change password (`current_password`, `new_password`, `new_password_confirm`) |

Register body:

```json
{
  "name": "Test User",
  "email": "test@example.com",
  "phone": "05551234567",
  "password": "Test1234!",
  "password_confirm": "Test1234!",
  "kvkk_accepted": true,
  "newsletter_allowed": false
}
```

## Catalog

| Method | Endpoint | Auth | Description |
| --- | --- | --- | --- |
| GET | `/api/categories` | — | List categories |
| GET | `/api/categories/{category_id}` | — | One category |
| POST · PUT · DELETE | `/api/categories` · `/api/categories/{category_id}` | `category.create` · `.update` · `.delete` | Manage categories |
| GET | `/api/brands` | — | Active brands |
| GET | `/api/brands/admin` · `/api/brands/admin/{brand_id}` | `brand.read` | All brands, including inactive |
| POST | `/api/brands` | `brand.create` | Create brand |
| PATCH · DELETE | `/api/brands/{brand_id}` | `brand.update` · `brand.delete` | Edit or delete brand |
| GET | `/api/products` | — | Published products |
| GET | `/api/products/{product_id}` | — | One product |
| GET | `/api/products/admin` · `/api/products/admin/{product_id}` | `product.read` | All products, any status |
| POST · PUT · DELETE | `/api/products` · `/api/products/{product_id}` | `product.create` · `.update` · `.delete` | Manage products |
| GET · POST | `/api/products/{product_id}/variants` | — · `product.update` | List or add variants |
| PATCH · DELETE | `/api/products/{product_id}/variants/{variant_id}` | `product.update` · `product.delete` | Edit or remove a variant |
| GET · POST | `/api/products/{product_id}/images` | — · `product.update` | List or upload images |
| DELETE | `/api/products/{product_id}/images/{image_id}` | `product.update` | Remove an image |
| POST | `/api/uploads/images/{folder}` | `product.update` | Upload an image, returns its URL |

`GET /api/products` query params: `page`, `page_size` (≤ 100), `search`, `category_id`, `brand_id`, `price_min`, `price_max`, `sort_by`, `status`.

Product statuses: `draft`, `published`, `archived` (`active` / `inactive` are legacy values).
Images must be JPEG, PNG or WEBP, at most 5 MB and 25 megapixels. Uploaded files are served from `/uploads/...`.

## Cart

| Method | Endpoint | Description |
| --- | --- | --- |
| GET | `/api/cart` | Current cart (user or guest) |
| POST | `/api/cart/items` | Add `{"product_id": 1, "variant_id": null, "quantity": 2}` |
| PUT | `/api/cart/items/{item_id}` | Set `{"quantity": 3}` |
| DELETE | `/api/cart/items/{item_id}` | Remove one item |
| DELETE | `/api/cart/items` | Empty the cart |

## Addresses and favorites (signed-in customers)

| Method | Endpoint | Description |
| --- | --- | --- |
| GET · POST | `/api/addresses` | List or add |
| GET · PUT · DELETE | `/api/addresses/{address_id}` | Read, edit, delete |
| GET · POST | `/api/favorites` | List or add `{"product_id": 1}` |
| DELETE | `/api/favorites/{product_id}` | Remove |

Address fields: `title`, `recipient_name`, `phone`, `city`, `district`, `full_address`, `postal_code`, `is_default`.

## Orders

| Method | Endpoint | Auth | Description |
| --- | --- | --- | --- |
| POST | `/api/orders` | user or guest token | Check out the current cart |
| GET | `/api/orders/me` | user | My orders |
| GET | `/api/orders/me/{order_id}` | user | One of my orders |
| POST | `/api/orders/me/{order_id}/cancel` | user | Cancel my order (while still cancellable) |
| GET | `/api/orders/admin` | `order.read` | All orders, filter with `order_status` |
| GET | `/api/orders/admin/{order_id}` | `order.read` | Order detail |
| PATCH | `/api/orders/admin/{order_id}/status` | `order.update_status` | `{"status": "confirmed", "note": "..."}` |
| PATCH | `/api/orders/admin/{order_id}` | `order.add_note` + `order.update_tracking` | `{"admin_note": "...", "shipping_tracking_number": "..."}` |

Checkout body for a signed-in customer:

```json
{
  "shipping_address_id": 1,
  "billing_address_id": 1,
  "payment_method": "cod",
  "contract_accepted": true,
  "kvkk_accepted": true,
  "customer_note": "Please ring the bell"
}
```

Guests send `guest_name`, `guest_email`, `guest_phone` and a full `shipping_address` (and optionally `billing_address`) object instead of the address IDs. `contract_accepted` and `kvkk_accepted` must be `true`.

- Payment methods: `cod` (cash on delivery), `bank_transfer`.
- Statuses: `pending` → `confirmed` → `preparing` → `shipped` → `completed`, and `cancelled` from any of the first three. Other transitions return an error.

## Admin

| Method | Endpoint | Permission |
| --- | --- | --- |
| GET | `/api/admin/dashboard` | `dashboard.read` |
| GET · POST | `/api/admin/users` | `user.read` · `user.create` + `user.assign_role` |
| GET · PATCH | `/api/admin/users/{user_id}` | `user.read` · `user.update` + `user.assign_role` |
| DELETE | `/api/admin/users/{user_id}` | `user.delete` (not seeded, see below) |
| GET | `/api/admin/stock/products` | `stock.read` |
| PATCH | `/api/admin/stock/products/{product_id}` | `stock.update` |
| GET | `/api/admin/stock/movements` | `stock.read` |
| GET · POST | `/api/admin/notifications` | `notification.read` · `notification.update` |
| PATCH | `/api/admin/notifications/read-all` · `/api/admin/notifications/{id}/read` | `notification.update` |
| DELETE | `/api/admin/notifications/{id}` | `notification.update` |
| GET · POST | `/api/admin/settings` | `settings.read` · `settings.update` |
| PATCH · DELETE | `/api/admin/settings/{setting_id}` | `settings.update` |
| PUT | `/api/admin/settings/upsert` | `settings.update` |
| GET | `/api/admin/rbac/roles` · `/api/admin/rbac/permissions` | `user.assign_role` |
| PATCH | `/api/admin/rbac/roles/{role_id}` | `user.assign_role` |
| PUT | `/api/admin/rbac/roles/{role_id}/permissions` | `user.assign_role` |
| GET | `/api/admin/reports/sales` · `/api/admin/reports/monthly-sales` | `report.read` |
| GET | `/api/admin/reports/sales/export.csv` | `report.export` |

Where two permissions are joined with `+`, the user needs both.

## Status codes

| Code | Meaning |
| --- | --- |
| 401 | Missing or invalid token |
| 403 | Signed in but missing the permission. Show a message; don't log the user out. |
| 404 | Not found |
| 409 | Conflict, for example not enough stock at checkout |
| 422 | Validation or business-rule error |
| 429 | Rate limit hit (120 requests per minute per IP) |

## Known gaps

- `DELETE /api/admin/users/{user_id}` requires `user.delete`, which `app/seeds/rbac_seed.py` does not create, so it returns `403` for everyone until that permission is added to the seed.
- No forgot/reset password endpoints yet.
- Products are fetched by numeric `product_id`, not by slug.
- No color or size filters yet.
- Email notifications are off unless `EMAIL_ENABLED=true` and SMTP is configured.
