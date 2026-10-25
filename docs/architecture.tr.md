# Mimari

🇬🇧 [English](architecture.md)

## Genel bakış

```
React SPA (Vite, :3000)
  ├── Mağaza          /, /shop, /cart, /checkout, /account/…
  └── Yönetim paneli  /admin/…
        │  Axios, Authorization'da JWT, misafir için X-Session-Token
        ▼
FastAPI (:8000)
  middleware: SecurityHeaders → RateLimit (IP başına 120/dk) → CORS
  router'lar → servisler → repository'ler → SQLModel
        │
        ▼
PostgreSQL 16 (Alembic migration'ları)        uploads/ (/uploads altından sunulur)
```

## Backend katmanları

| Katman | Klasör | Sorumluluk |
| --- | --- | --- |
| Router'lar | `app/routers/` | HTTP route'ları, istek doğrulama, yetki bağımlılıkları, `{success, data, message, errors}` yapısı |
| Servisler | `app/services/` | İş kuralları: checkout, stok, sipariş durum makinesi, RBAC, denetim, dosya depolama, raporlar |
| Repository'ler | `app/repositories/` | Veritabanı sorguları |
| Modeller | `app/models/` | SQLModel tablo sınıfları ve enum'lar |
| Şemalar | `app/schemas/` | Pydantic istek ve yanıt modelleri |
| Çekirdek | `app/core/` | Ayarlar, JWT + Argon2, bağımlılıklar (`get_current_user`, `require_permission`), middleware, hata yakalayıcılar |

`AppError` alt sınıfı olarak fırlatılan hatalar `app/core/handlers.py` tarafından standart yanıt yapısına çevrilir; doğrulama hataları ve beklenmeyen istisnalar da aynı şekilde işlenir.

## Veri modeli

| Alan | Tablolar |
| --- | --- |
| Kullanıcı ve erişim | `users`, `roles`, `permissions`, `role_permission` |
| Katalog | `categories`, `brands`, `products`, `product_variants`, `product_images` |
| Alışveriş | `carts`, `cart_items`, `favorites`, `addresses` |
| Siparişler | `orders`, `order_items`, `order_status_history` |
| Operasyon | `stock_movements`, `notifications`, `settings`, `audit_logs` |

Migration'lar `app/migrations/versions/` altında (ilk şema, denetim kaydı koruması, giriş kilitleme alanları, ürün tedarikçisi, marka kategorisi, kullanıcı onay alanları, ürün durumu normalizasyonu).

## Roller ve izinler

`app/seeds/rbac_seed.py` tarafından oluşturulur:

| Rol | İzinler |
| --- | --- |
| `admin` | Tüm izinler |
| `personnel` | Ürün, kategori, marka, müşteri ve dashboard okuma; siparişleri görme ve ilerletme (durum, not, takip); stok okuma ve güncelleme; bildirim okuma ve güncelleme |
| `customer` | Yönetim API'sinde izni yok. Müşteriler `/api/auth/me`, sepet, adres, favori ve `/api/orders/me` route'larını kullanır. |

İzin adları `alan.işlem` biçimindedir: `product.create`, `order.update_status`, `stock.update`, `report.export`, `user.assign_role`, `audit.read` vb. Route'lar ihtiyaç duydukları izni `require_permission("…")` ile belirtir; birden fazla izin yazılmışsa kullanıcının hepsine sahip olması gerekir. Adminler `/api/admin/rbac` üzerinden hangi rolün hangi izinlere sahip olduğunu değiştirebilir.

## Checkout ve stok

`app/services/order_service.py` siparişi tek bir veritabanı transaction'ı içinde oluşturur:

1. Sepeti yükle (kullanıcıya göre ya da misafirler için `X-Session-Token` ile).
2. Her ürün için stok satırını `SELECT … FOR UPDATE` ile kilitle, yeterli olduğunu kontrol et, düş ve `reserved` stok hareketi yaz.
3. Herhangi bir üründe stok yetmezse her şeyi geri al ve çakışmaları listeleyen `409` dön.
4. Aksi halde siparişi ve kalemlerini oluştur, sepeti boşalt, stoğu eşiğin altına düşen ürünler için düşük stok bildirimi üret.

Sipariş iptal edildiğinde stok `released` hareketiyle geri eklenir. Personel stok sayfasından `in`, `out` ve `adjustment` hareketleri de girebilir.

## Sipariş durum makinesi

`app/services/order_state_machine.py` yalnızca şu geçişlere izin verir:

```
pending ──► confirmed ──► preparing ──► shipped ──► completed
   │            │             │
   └────────────┴─────────────┴──► cancelled
```

`completed` ve `cancelled` son durumlardır. Her değişiklik `order_status_history` tablosuna yazılır.

## Güvenlik

- **Şifreler:** `pwdlib` ile Argon2.
- **Token'lar:** `SECRET_KEY` ile imzalanan HS256 JWT, varsayılan ömür 60 dakika.
- **Kaba kuvvet:** 5 hatalı girişten sonra hesap 15 dakika kilitlenir (ayarlanabilir).
- **Hız sınırı:** İstemci IP'si başına dakikada 120 istek, bellekte tutulur (`app/core/rate_limit.py`). Yeniden başlatmada sıfırlanır ve process başınadır.
- **Başlıklar:** `X-Content-Type-Options`, `X-Frame-Options: DENY`, `Referrer-Policy`, `Permissions-Policy`, HSTS ve API yanıtlarında CSP.
- **Denetim kaydı:** `audit_logs` yalnızca eklenebilir. `002` migration'ı, bu tablodaki `UPDATE` ve `DELETE`'i etkisiz hale getiren PostgreSQL kuralları ekler; uygulama ele geçirilse bile geçmiş değiştirilemez. Handler'lar `app/middleware/audit_middleware.py` içindeki `@audited(action=…, tracked_fields=[…])` dekoratörüyle kayıt tutabilir.
- **Yüklemeler:** İçerik türü kontrolü (JPEG, PNG, WEBP), 5 MB ve 25 megapiksel sınırı, `uploads/` altında saklanır.
- **CORS:** Yalnızca 3000–3002 ve 5173–5174 portlarındaki `localhost` / `127.0.0.1`. Deploy etmeden önce alan adınızı `app/main.py` içine ekleyin.

## Frontend

| Klasör | İçerik |
| --- | --- |
| `src/routes/` | `AppRouter.jsx`, `ProtectedRoute` (personel), `CustomerRoute` (müşteriler) |
| `src/layouts/` | Mağaza layout'u ve navbar; yönetim layout'u ve sidebar |
| `src/pages/store/` | Ana sayfa, mağaza, ürün detayı, sepet, checkout, müşteri girişi, hesap sayfaları |
| `src/pages/…` | Yönetim: dashboard, ürünler, kategori ve markalar, duruma göre siparişler, stok, kullanıcılar, roller, raporlar, ayarlar, bildirimler, profil |
| `src/services/` | Alan başına bir Axios istemcisi; ortak `api.js` JWT'yi veya misafir session token'ını ekler |
| `src/context/` | `AuthContext`, `CartContext`, `OrderContext` |
| `src/components/` | Grafikler (Recharts), veri tablosu, modal'lar, görsel yükleyici, ürün formu ve varyant oluşturucu |

JWT `localStorage` içinde (`shop_admin_user`), misafir sepet token'ı ise `shop_session_token` anahtarında tutulur.
