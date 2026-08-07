# Modern E-Commerce API Entegrasyon Rehberi

## 1. Temel Bilgiler

- Backend branch: `feature/backend-api`
- API adresi: `http://localhost:8000/api`
- Swagger: `http://localhost:8000/docs`
- OpenAPI JSON: `http://localhost:8000/openapi.json`

Frontend `.env` ayarı:

```env
VITE_API_BASE_URL=http://localhost:8000/api
VITE_USE_MOCK=false
```

Backend’i çalıştırma:

```powershell
python -m uvicorn app.main:app --reload
```

## 2. Standart Response Yapısı

Bütün JSON endpoint’leri şu yapıyı döndürür:

```json
{
  "success": true,
  "data": {},
  "message": "İşlem başarılı.",
  "errors": []
}
```

Frontend gerçek veriye Axios kullanıyorsa `response.data.data` üzerinden ulaşmalıdır.

## 3. JWT Yetkilendirme

Giriş endpoint’i:

```http
POST /api/auth/login
```

Giriş body:

```json
{
  "email": "user@example.com",
  "password": "Test1234!"
}
```

Token alanı:

```text
data.access_token
```

Korumalı isteklerde:

```http
Authorization: Bearer ACCESS_TOKEN
```

Rol değerleri:

- `admin`
- `personnel`
- `customer`

## 4. Kimlik ve Profil Endpoint’leri

| Metot | Endpoint | Açıklama |
|---|---|---|
| POST | `/api/auth/register` | Kullanıcı kaydı |
| POST | `/api/auth/login` | Giriş ve JWT alma |
| GET | `/api/auth/me` | Oturum sahibini getir |
| PATCH | `/api/auth/me` | Profil güncelle |
| PATCH | `/api/auth/me/password` | Şifre değiştir |

Kayıt body:

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

Profil güncelleme alanları:

- `name`
- `email`
- `phone`
- `newsletter_allowed`

Şifre değiştirme alanları:

- `current_password`
- `new_password`
- `new_password_confirm`

## 5. Katalog Endpoint’leri

### Kategoriler

| Metot | Endpoint |
|---|---|
| GET, POST | `/api/categories` |
| GET, PUT, DELETE | `/api/categories/{category_id}` |

### Markalar

| Metot | Endpoint |
|---|---|
| GET | `/api/brands` |
| GET | `/api/brands/{brand_id}` |
| GET, POST | `/api/brands/admin` |
| GET, PUT, DELETE | `/api/brands/admin/{brand_id}` |

### Ürünler

| Metot | Endpoint |
|---|---|
| GET, POST | `/api/products` |
| GET, PUT, DELETE | `/api/products/{product_id}` |

Ürün listeleme query alanları:

- `page`
- `page_size`
- `search`
- `category_id`

Ürün durumları:

- `draft`
- `published`
- `archived`

`supplier` alanı şu anda backend ve veritabanında bulunmamaktadır.

### Varyantlar ve Görseller

| Metot | Endpoint |
|---|---|
| GET, POST | `/api/products/{product_id}/variants` |
| PUT, DELETE | `/api/products/{product_id}/variants/{variant_id}` |
| GET, POST | `/api/products/{product_id}/images` |
| DELETE | `/api/products/{product_id}/images/{image_id}` |

Görseller JPEG, PNG veya WEBP olmalı ve en fazla 5 MB olabilir.

## 6. Sepet Endpoint’leri

| Metot | Endpoint |
|---|---|
| GET | `/api/cart` |
| POST | `/api/cart/items` |
| PUT | `/api/cart/items/{item_id}` |
| DELETE | `/api/cart/items/{item_id}` |
| DELETE | `/api/cart/items` |

Sepete ürün ekleme:

```json
{
  "product_id": 1,
  "variant_id": null,
  "quantity": 2
}
```

Miktar güncelleme:

```json
{
  "quantity": 3
}
```

### Misafir Sepeti

İlk misafir sepet isteği token olmadan yapılır. Backend response içindeki `data.session_token` değeri `localStorage` içine kaydedilmelidir.

Sonraki sepet ve checkout isteklerinde:

```http
X-Session-Token: SESSION_TOKEN
```

header’ı gönderilmelidir. Frontend kendi session token’ını üretmemelidir.

## 7. Adres Endpoint’leri

| Metot | Endpoint |
|---|---|
| GET, POST | `/api/addresses` |
| GET, PUT, DELETE | `/api/addresses/{address_id}` |

Adres alanları:

- `title`
- `recipient_name`
- `phone`
- `city`
- `district`
- `full_address`
- `postal_code`
- `is_default`

## 8. Favori Endpoint’leri

| Metot | Endpoint |
|---|---|
| GET, POST | `/api/favorites` |
| DELETE | `/api/favorites/{product_id}` |

Favoriye ekleme:

```json
{
  "product_id": 1
}
```

## 9. Sipariş Endpoint’leri

| Metot | Endpoint |
|---|---|
| POST | `/api/orders` |
| GET | `/api/orders/me` |
| GET | `/api/orders/me/{order_id}` |
| POST | `/api/orders/me/{order_id}/cancel` |
| GET | `/api/orders/admin` |
| GET | `/api/orders/admin/{order_id}` |
| PATCH | `/api/orders/admin/{order_id}/status` |
| PATCH | `/api/orders/admin/{order_id}` |

Kayıtlı kullanıcı checkout body:

```json
{
  "shipping_address_id": 1,
  "billing_address_id": 1,
  "payment_method": "cod",
  "customer_note": "Test siparişi",
  "contract_version_accepted": "v1"
}
```

Ödeme yöntemleri:

- `cod`
- `bank_transfer`

Sipariş durumları:

- `pending`
- `confirmed`
- `preparing`
- `shipped`
- `completed`
- `cancelled`

Durum güncelleme:

```json
{
  "status": "confirmed",
  "note": "Sipariş onaylandı."
}
```

Admin notu ve kargo takip güncelleme:

```json
{
  "admin_note": "Kargo bilgisi kontrol edildi.",
  "shipping_tracking_number": "TRACK-001"
}
```

## 10. Admin Endpoint’leri

| Modül | Endpoint |
|---|---|
| Dashboard | `GET /api/admin/dashboard` |
| Kullanıcılar | `/api/admin/users` |
| Stok güncelleme | `PATCH /api/admin/stock/products/{product_id}` |
| Stok hareketleri | `GET /api/admin/stock/movements` |
| Bildirimler | `/api/admin/notifications` |
| Ayarlar | `/api/admin/settings` |
| Roller | `GET /api/admin/rbac/roles` |
| İzinler | `GET /api/admin/rbac/permissions` |
| Satış raporu | `GET /api/admin/reports/sales` |
| CSV raporu | `GET /api/admin/reports/sales/export.csv` |

Admin paneli mock veriler yerine bu endpoint’leri kullanmalıdır.

## 11. HTTP Durum Kodları

- `401`: Token yok veya geçersiz
- `403`: Kullanıcının gerekli izni yok
- `404`: Kayıt bulunamadı
- `409`: Çakışma veya yetersiz stok
- `422`: İş kuralı ihlali
- `429`: Rate limit aşıldı

Frontend, `403` cevabında kullanıcıyı çıkış yaptırmamalı; yalnızca yetkisiz işlem mesajı göstermelidir.

## 12. Bilinen Sınırlamalar

- Şifremi unuttum/sıfırlama endpoint’leri henüz yok.
- `terms_accepted` backend’e kaydedilmiyor.
- Ürünler slug yerine sayısal `product_id` ile getiriliyor.
- Marka, fiyat, renk ve beden filtreleri henüz yok.
- `supplier` alanı veritabanında yok.
- Frontend branch’leri backend ile ortak Git geçmişine sahip değildir; entegrasyon kontrollü bir branch üzerinde yapılmalıdır.