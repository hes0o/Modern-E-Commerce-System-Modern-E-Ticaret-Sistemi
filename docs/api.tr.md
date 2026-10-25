# API referansı

🇬🇧 [English](api.md)

- Temel adres: `http://localhost:8000` (tüm route'lar `/api` ile başlar)
- Swagger: `http://localhost:8000/docs` · OpenAPI JSON: `http://localhost:8000/openapi.json`
- Sağlık kontrolü: `GET /api/health`

## Yanıt yapısı

Tüm JSON endpoint'leri aynı yapıda yanıt verir:

```json
{
  "success": true,
  "data": {},
  "message": "İşlem başarılı.",
  "errors": []
}
```

Axios ile veriye `response.data.data` üzerinden ulaşılır.

## Kimlik doğrulama

`POST /api/auth/login` isteği `{"email": "...", "password": "..."}` ile `data.access_token` içinde bir JWT döner. Korumalı route'larda gönderin:

```http
Authorization: Bearer <access_token>
```

Token'lar `ACCESS_TOKEN_EXPIRE_MINUTES` (varsayılan 60) sonra geçersiz olur. `LOGIN_MAX_FAILED_ATTEMPTS` (varsayılan 5) hatalı şifreden sonra hesap `LOGIN_LOCK_MINUTES` (varsayılan 15) boyunca kilitlenir.

Roller: `admin`, `personnel`, `customer`. Yönetim route'ları adlandırılmış izinleri kontrol eder (ör. `order.update_status`); bkz. [architecture.tr.md](architecture.tr.md#roller-ve-izinler).

### Misafir sepeti ve checkout

Token'sız ilk sepet isteği bir misafir sepeti oluşturur ve `data.session_token` döner. Bunu saklayıp sonraki sepet ve checkout isteklerinde gönderin:

```http
X-Session-Token: <session_token>
```

Bu token'ı istemcide üretmeyin.

## Kimlik ve profil

| Metot | Endpoint | Yetki | Açıklama |
| --- | --- | --- | --- |
| POST | `/api/auth/register` | — | Müşteri hesabı oluştur |
| POST | `/api/auth/login` | — | Giriş yap, JWT al |
| GET | `/api/auth/me` | kullanıcı | Oturum sahibi |
| PATCH | `/api/auth/me` | kullanıcı | `name`, `email`, `phone`, `newsletter_allowed` güncelle |
| PATCH | `/api/auth/me/password` | kullanıcı | Şifre değiştir (`current_password`, `new_password`, `new_password_confirm`) |

Kayıt gövdesi:

```json
{
  "name": "Test Kullanıcı",
  "email": "test@example.com",
  "phone": "05551234567",
  "password": "Test1234!",
  "password_confirm": "Test1234!",
  "kvkk_accepted": true,
  "newsletter_allowed": false
}
```

## Katalog

| Metot | Endpoint | Yetki | Açıklama |
| --- | --- | --- | --- |
| GET | `/api/categories` | — | Kategorileri listele |
| GET | `/api/categories/{category_id}` | — | Tek kategori |
| POST · PUT · DELETE | `/api/categories` · `/api/categories/{category_id}` | `category.create` · `.update` · `.delete` | Kategori yönetimi |
| GET | `/api/brands` | — | Aktif markalar |
| GET | `/api/brands/admin` · `/api/brands/admin/{brand_id}` | `brand.read` | Pasifler dahil tüm markalar |
| POST | `/api/brands` | `brand.create` | Marka oluştur |
| PATCH · DELETE | `/api/brands/{brand_id}` | `brand.update` · `brand.delete` | Marka düzenle veya sil |
| GET | `/api/products` | — | Yayındaki ürünler |
| GET | `/api/products/{product_id}` | — | Tek ürün |
| GET | `/api/products/admin` · `/api/products/admin/{product_id}` | `product.read` | Her durumdaki tüm ürünler |
| POST · PUT · DELETE | `/api/products` · `/api/products/{product_id}` | `product.create` · `.update` · `.delete` | Ürün yönetimi |
| GET · POST | `/api/products/{product_id}/variants` | — · `product.update` | Varyantları listele veya ekle |
| PATCH · DELETE | `/api/products/{product_id}/variants/{variant_id}` | `product.update` · `product.delete` | Varyant düzenle veya sil |
| GET · POST | `/api/products/{product_id}/images` | — · `product.update` | Görselleri listele veya yükle |
| DELETE | `/api/products/{product_id}/images/{image_id}` | `product.update` | Görsel sil |
| POST | `/api/uploads/images/{folder}` | `product.update` | Görsel yükle, URL'sini döner |

`GET /api/products` query parametreleri: `page`, `page_size` (≤ 100), `search`, `category_id`, `brand_id`, `price_min`, `price_max`, `sort_by`, `status`.

Ürün durumları: `draft`, `published`, `archived` (`active` / `inactive` eski değerlerdir).
Görseller JPEG, PNG veya WEBP olmalı; en fazla 5 MB ve 25 megapiksel. Yüklenen dosyalar `/uploads/...` altından sunulur.

## Sepet

| Metot | Endpoint | Açıklama |
| --- | --- | --- |
| GET | `/api/cart` | Mevcut sepet (üye veya misafir) |
| POST | `/api/cart/items` | Ekle: `{"product_id": 1, "variant_id": null, "quantity": 2}` |
| PUT | `/api/cart/items/{item_id}` | Miktar: `{"quantity": 3}` |
| DELETE | `/api/cart/items/{item_id}` | Tek ürünü çıkar |
| DELETE | `/api/cart/items` | Sepeti boşalt |

## Adresler ve favoriler (giriş yapmış müşteriler)

| Metot | Endpoint | Açıklama |
| --- | --- | --- |
| GET · POST | `/api/addresses` | Listele veya ekle |
| GET · PUT · DELETE | `/api/addresses/{address_id}` | Oku, düzenle, sil |
| GET · POST | `/api/favorites` | Listele veya ekle: `{"product_id": 1}` |
| DELETE | `/api/favorites/{product_id}` | Kaldır |

Adres alanları: `title`, `recipient_name`, `phone`, `city`, `district`, `full_address`, `postal_code`, `is_default`.

## Siparişler

| Metot | Endpoint | Yetki | Açıklama |
| --- | --- | --- | --- |
| POST | `/api/orders` | kullanıcı veya misafir token'ı | Mevcut sepetle checkout |
| GET | `/api/orders/me` | kullanıcı | Siparişlerim |
| GET | `/api/orders/me/{order_id}` | kullanıcı | Siparişimin detayı |
| POST | `/api/orders/me/{order_id}/cancel` | kullanıcı | Siparişimi iptal et (iptal edilebilir durumdaysa) |
| GET | `/api/orders/admin` | `order.read` | Tüm siparişler, `order_status` ile filtre |
| GET | `/api/orders/admin/{order_id}` | `order.read` | Sipariş detayı |
| PATCH | `/api/orders/admin/{order_id}/status` | `order.update_status` | `{"status": "confirmed", "note": "..."}` |
| PATCH | `/api/orders/admin/{order_id}` | `order.add_note` + `order.update_tracking` | `{"admin_note": "...", "shipping_tracking_number": "..."}` |

Giriş yapmış müşteri için checkout gövdesi:

```json
{
  "shipping_address_id": 1,
  "billing_address_id": 1,
  "payment_method": "cod",
  "contract_accepted": true,
  "kvkk_accepted": true,
  "customer_note": "Lütfen zili çalın"
}
```

Misafirler adres kimlikleri yerine `guest_name`, `guest_email`, `guest_phone` ve eksiksiz bir `shipping_address` (isteğe bağlı `billing_address`) nesnesi gönderir. `contract_accepted` ve `kvkk_accepted` `true` olmalıdır.

- Ödeme yöntemleri: `cod` (kapıda ödeme), `bank_transfer` (havale/EFT).
- Durumlar: `pending` → `confirmed` → `preparing` → `shipped` → `completed`; ilk üçünden `cancelled`'a geçilebilir. Diğer geçişler hata döner.

## Yönetim

| Metot | Endpoint | İzin |
| --- | --- | --- |
| GET | `/api/admin/dashboard` | `dashboard.read` |
| GET · POST | `/api/admin/users` | `user.read` · `user.create` + `user.assign_role` |
| GET · PATCH | `/api/admin/users/{user_id}` | `user.read` · `user.update` + `user.assign_role` |
| DELETE | `/api/admin/users/{user_id}` | `user.delete` (seed'de yok, aşağıya bakın) |
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

İki izin `+` ile birleştirilmişse kullanıcının ikisine de sahip olması gerekir.

## HTTP durum kodları

| Kod | Anlam |
| --- | --- |
| 401 | Token yok veya geçersiz |
| 403 | Giriş yapılmış ama izin yok. Mesaj gösterin, kullanıcıyı çıkış yaptırmayın. |
| 404 | Kayıt bulunamadı |
| 409 | Çakışma, ör. checkout sırasında yetersiz stok |
| 422 | Doğrulama veya iş kuralı hatası |
| 429 | Hız sınırı aşıldı (IP başına dakikada 120 istek) |

## Bilinen eksikler

- `DELETE /api/admin/users/{user_id}` `user.delete` izni ister, ancak `app/seeds/rbac_seed.py` bu izni oluşturmaz; seed'e eklenene kadar herkese `403` döner.
- Şifremi unuttum / sıfırlama endpoint'leri henüz yok.
- Ürünler slug yerine sayısal `product_id` ile getiriliyor.
- Renk ve beden filtreleri henüz yok.
- `EMAIL_ENABLED=true` yapılıp SMTP ayarlanmadıkça e-posta bildirimi gönderilmez.
