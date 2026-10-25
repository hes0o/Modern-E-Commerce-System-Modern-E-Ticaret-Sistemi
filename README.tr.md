# 🛍️ Modern E-Ticaret Sistemi

> FastAPI + PostgreSQL backend üzerinde müşteri mağazası ve yönetim paneli sunan full-stack e-ticaret platformu: rol tabanlı yetkilendirme, transaction içinde stok yönetimi, sipariş durum makinesi ve değiştirilemez denetim kaydı.

🇬🇧 [English README](README.md) · 📚 [Dokümantasyon](docs/)

---

## Özellikler

**Mağaza**
- Kategori, marka, varyant ve görsel galerili ürün kataloğu; arama, kategori/marka/fiyat filtreleri ve sıralama.
- Misafir (session token) ve giriş yapmış müşteriler için sepet.
- Misafir veya üye checkout: kayıtlı ya da elle girilen adres, kapıda ödeme veya havale/EFT, zorunlu Mesafeli Satış Sözleşmesi ve KVKK onayı.
- Müşteri hesabı: profil, şifre, sipariş geçmişi ve iptal, favoriler, adres defteri.

**Yönetim paneli** (`/admin`)
- Satış grafikleri ve en çok satan ürünlerle dashboard.
- Ürünler, varyantlar, görseller, kategoriler ve markalar.
- Duruma göre siparişler (bekleyen, hazırlanan, kargodaki, teslim edilen, iptal), durum değişikliği, yönetici notu, kargo takip numarası, barkodlu kargo etiketi.
- Stok seviyeleri, manuel stok hareketleri ve düşük stok bildirimleri.
- Personel kullanıcıları, roller ve izinler; sistem ayarları; CSV dışa aktarımlı satış raporları.

**Backend**
- Rol tabanlı erişim: `admin`, `personnel` ve `customer` rolleri, 30'dan fazla ayrıntılı izin.
- Siparişler stok satırları kilitlenerek (`SELECT … FOR UPDATE`) tek bir veritabanı transaction'ında oluşturulur; iki alıcı son ürünü aynı anda satın alamaz.
- Sipariş durum değişiklikleri bir durum makinesiyle doğrulanır.
- PostgreSQL kurallarıyla korunan, yalnızca eklenebilir `audit_logs` tablosu.
- Argon2 şifre hash'leme, JWT, art arda hatalı girişte hesap kilitleme, IP başına hız sınırı (dakikada 120 istek) ve güvenlik başlıkları.

## Teknolojiler

| Katman | Teknoloji |
| --- | --- |
| Backend | Python 3.11+, FastAPI, SQLModel / SQLAlchemy 2, Alembic, Pydantic 2 |
| Kimlik ve güvenlik | PyJWT, pwdlib (Argon2), özel hız sınırı ve güvenlik başlığı middleware'leri |
| Veritabanı | PostgreSQL 16 |
| Frontend | React 18, Vite 5, React Router 6, Tailwind CSS 3, Axios, Recharts, lucide-react |
| Test | pytest, httpx / FastAPI TestClient |
| Araçlar | uv, Ruff, Docker Compose (veritabanı) |

## Hızlı başlangıç

### 1. Veritabanı

```bash
git clone https://github.com/hes0o/Modern-E-Commerce-System-Modern-E-Ticaret-Sistemi.git
cd Modern-E-Commerce-System-Modern-E-Ticaret-Sistemi

cp .env.example .env
docker compose up -d db          # localhost:5432'de PostgreSQL 16
```

`docker-compose.yml` yalnızca veritabanını çalıştırır. API ve frontend kendi makinenizde çalışır.

### 2. Backend

```bash
uv sync --extra dev              # veya: python -m venv .venv && pip install -e ".[dev]"
uv run alembic upgrade head      # tabloları oluştur
uv run python -m app.seeds       # roller, izinler ve demo kullanıcılar
uv run python seed_products.py   # isteğe bağlı: demo kategori, marka, ürünler

uv run uvicorn app.main:app --reload
```

API: http://localhost:8000/api · Swagger: http://localhost:8000/docs · Sağlık: http://localhost:8000/api/health

### 3. Frontend

```bash
npm install
npm run dev                      # http://localhost:3000
```

Frontend varsayılan olarak `http://localhost:8000` adresini çağırır. Başka bir adres için frontend `.env` dosyasında `VITE_API_BASE_URL` değerini (`/api` olmadan) ayarlayın.

- Mağaza: http://localhost:3000
- Yönetim paneli: http://localhost:3000/admin

`python -m app.seeds` ile oluşturulan demo hesaplar `app/seeds/user_seed.py` içinde. Canlıya almadan önce değiştirin veya silin.

Tam kurulum, testler ve sorun giderme: [docs/setup.tr.md](docs/setup.tr.md).

## Dokümantasyon

| Doküman | İçerik |
| --- | --- |
| [docs/architecture.tr.md](docs/architecture.tr.md) | Katmanlar, veri modeli, RBAC, sipariş ve stok akışı, güvenlik |
| [docs/api.tr.md](docs/api.tr.md) | Tüm endpoint'ler, yanıt formatı, kimlik doğrulama, hata kodları |
| [docs/setup.tr.md](docs/setup.tr.md) | Ortam değişkenleri, migration'lar, seed'ler, testler |

## Proje yapısı

```
app/
├── core/          ayarlar, JWT + şifre hash'leme, bağımlılıklar, hız sınırı, güvenlik başlıkları, hatalar
├── models/        SQLModel tabloları
├── schemas/       istek/yanıt modelleri
├── repositories/  veritabanı sorguları
├── services/      iş mantığı (sipariş, stok, RBAC, denetim, yükleme, …)
├── routers/       FastAPI route'ları, modül başına bir dosya
├── middleware/    @audited dekoratörü
├── migrations/    Alembic revizyonları
└── seeds/         roller, izinler, demo kullanıcılar
src/
├── pages/store/   mağaza sayfaları
├── pages/…        yönetim sayfaları (dashboard, ürünler, siparişler, stok, kullanıcılar, roller, raporlar, ayarlar)
├── services/      Axios API istemcileri
├── context/       auth, sepet, siparişler
└── routes/        router ve route korumaları
tests/             pytest testleri (auth, katalog, sepet/sipariş, RBAC, durum makinesi, denetim kaydı)
```

## Lisans

Henüz lisans dosyası yok. Aksi belirtilmedikçe tüm hakları yazarlarına aittir.
