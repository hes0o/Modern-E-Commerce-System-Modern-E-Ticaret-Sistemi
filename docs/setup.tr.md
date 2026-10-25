# Kurulum

🇬🇧 [English](setup.md)

## Gereksinimler

- Python 3.11+ ve [uv](https://docs.astral.sh/uv/) (veya pip)
- Node.js 18+ ve npm
- Docker ya da erişebildiğiniz bir PostgreSQL 16 sunucusu

## Ortam değişkenleri

`.env.example` dosyasını `.env` olarak kopyalayın. Backend bunu `python-dotenv` ile okur.

| Değişken | Varsayılan | Not |
| --- | --- | --- |
| `DATABASE_URL` | `postgresql://ecommerce_user:ecommerce_pass@localhost:5432/ecommerce_db` | `docker-compose.yml` ile eşleşir. Alembic de bunu kullanır. |
| `SECRET_KEY` | `change-me-in-production` | JWT imzalama anahtarı. **Geliştirme dışında uzun, rastgele bir değer verin.** |
| `JWT_ALGORITHM` | `HS256` | |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | `60` | |
| `LOGIN_MAX_FAILED_ATTEMPTS` | `5` | |
| `LOGIN_LOCK_MINUTES` | `15` | |
| `APP_NAME`, `APP_VERSION`, `APP_ENV` | | Swagger'da görünür |
| `EMAIL_ENABLED` | `false` | E-posta gönderimini açar |
| `SMTP_HOST`, `SMTP_PORT`, `SMTP_USERNAME`, `SMTP_PASSWORD` | | Kod `SMTP_USERNAME` okur; `.env.example` hâlâ `SMTP_USER` yazıyor. |
| `SMTP_FROM_EMAIL`, `SMTP_FROM_NAME`, `SMTP_USE_TLS` | | |

Frontend (`package.json` yanında isteğe bağlı `.env`):

| Değişken | Varsayılan | Not |
| --- | --- | --- |
| `VITE_API_BASE_URL` | `http://localhost:8000` | Yalnızca origin. Servisler `/api/...` kısmını zaten ekler, buraya `/api` yazmayın. |

## Veritabanı

```bash
docker compose up -d db
uv run alembic upgrade head
```

Bir modeli değiştirdikten sonra yeni migration:

```bash
uv run alembic revision --autogenerate -m "değişikliği açıklayın"
uv run alembic upgrade head
```

## Seed verisi

```bash
uv run python -m app.seeds        # roller, izinler, demo admin / personel / müşteri
uv run python seed_products.py    # demo kategori, marka, ürün ve varyantlar
```

İkisi de tekrar çalıştırılabilir: var olan kayıtları atlar. Demo giriş bilgileri `app/seeds/user_seed.py` içinde; herkese açık bir sunucuda bunları oluşturmayın.

## Çalıştırma

```bash
uv run uvicorn app.main:app --reload     # API :8000'de
npm run dev                              # frontend :3000'de
```

Yüklenen görseller `./uploads` klasörüne gider (ilk yüklemede oluşur) ve `/uploads/...` altından sunulur. Bu yolun doğru çözülmesi için API'yi depo kökünden başlatın.

## Testler

```bash
uv run pytest
```

Testler varsayılan olarak SQLite (`./test.db`) kullanır. PostgreSQL'e karşı çalıştırmak için `TEST_DATABASE_URL` ayarlayın. Denetim kaydı kuralları ve satır kilitleri gibi bazı davranışlar yalnızca PostgreSQL'de vardır.

| Dosya | Kapsam |
| --- | --- |
| `test_auth_api.py` | Kayıt, giriş, `/me`, kilitleme ve kilidin açılması |
| `test_catalog_api.py` | Kategoriler, yayındaki ve gizli ürünler, arşivleme |
| `test_customer_api.py` | Adresler, favoriler, sepet |
| `test_order_api.py`, `test_order_transaction.py` | Checkout toplamları, stok düşme ve iade, misafir checkout, yetersiz stok, durum geçmişi |
| `test_state_machine.py` | İzin verilen ve reddedilen sipariş geçişleri |
| `test_rbac.py` | Seed edilen roller ve izinler, personel sınırları |
| `test_admin_api.py` | Role göre dashboard erişimi |
| `test_audit_log.py` | Fiyat, durum ve rol değişiklikleri için denetim kayıtları |

Lint: `uv run ruff check .`.

## Production derlemesi

```bash
npm run build            # statik dosyalar dist/ içinde
```

Deploy etmeden önce:

- `SECRET_KEY` ve production `DATABASE_URL` değerlerini ayarlayın,
- frontend alan adınızı `app/main.py` içindeki CORS listesine ekleyin,
- `dist/` klasörünü, istemci route'ları için `index.html`'e düşen bir web sunucusuyla sunun,
- birden fazla API worker'ı ancak bellekteki hız sınırının worker başına olmasını kabul ediyorsanız çalıştırın.

## Sorun giderme

| Belirti | Çözüm |
| --- | --- |
| 5432'de `connection refused` | `docker compose ps`. `ecommerce_db` konteyneri healthy mi? |
| İstekler `/api/api/...` adresine gidiyor | `VITE_API_BASE_URL` içinden `/api`'yi kaldırın. |
| Tarayıcıda CORS hatası | 3000 veya 5173 portunu kullanın ya da origin'inizi `app/main.py`'ye ekleyin. |
| Yönetim sayfasında `403` | Kullanıcının rolünde o izin yok. Roller sayfasından kontrol edin. |
| `seed_customer.py` `app.models.role`'ü import edemiyor | O yardımcı script eski; yerine `python -m app.seeds` kullanın. |
