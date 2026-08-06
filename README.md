# Norda — E-Ticaret Müşteri Frontend

Prodrom stajı / Modern E-Ticaret Sistemi projesi — müşteri arayüzü (customer frontend).
React + Vite + Tailwind CSS + react-router-dom.

## Kurulum

```bash
npm install
npm run dev
```

`.env` dosyası `VITE_USE_MOCK=true` ile geliyor — yani **backend API'leri hazır
olmadan da tüm akışları (kayıt, giriş, sepet, sipariş) uçtan uca test
edebilirsin.** Backend hazır olduğunda:

```bash
# .env
VITE_API_BASE_URL=http://localhost:8000/api
VITE_USE_MOCK=false
```

değiştir, hiçbir component/sayfa kodunu değiştirmen gerekmez — sadece
`src/api/*.js` içindeki fonksiyonlar gerçek `fetch` çağrısına döner.

## Klasör yapısı

```
src/
  api/            -> backend ile konusan TEK katman (SRS S18 ile eslesir)
  components/
    layout/       -> Header, Footer, Layout, AccountLayout, StaticPage
    product/      -> ProductCard, ProductGrid (birden fazla sayfada kullaniliyor)
    filters/      -> FilterPanel
    common/       -> Badge, SkeletonCard, OrderStatusBadge
  context/        -> AuthContext, CartContext (global state)
  hooks/          -> useProductQuery (kategori/arama/filtre ortak mantigi)
  data/           -> mock.js - backend hazir degilken kullanilan ornek veri
  pages/          -> SRS Bolum 4'teki 21 sayfanin her biri
  lib/            -> format.js (fiyat formatlama vb. yardimcilar)
```

## Onemli mimari kararlar

**1. Isimlendirme sozlesmesi.** `src/api/*.js` icindeki her fonksiyon,
backend'e giden JSON govdesinde SRS S18'deki alan adlarini (`snake_case`)
birebir kullanir - bu sinirda camelCase->snake_case donusumu yapilmaz,
karmasiklik eklemeden basit tutuldu. Component'ler iceride camelCase
(`passwordConfirm`) kullanir, `api/` katmani sinirda donusturur.

**2. Frontend is kurali barindirmaz.** Stok kontrolu, fiyat hesaplama gibi
kararlar backend'den gelir; frontend sadece gosterir (SRS S2.3).

**3. Filtre state URL'de tutulur.** `useProductQuery` hook'u kategori/arama
sayfalarindaki filtreleri `useSearchParams` ile URL query string'e yazar -
paylasilabilir link gereksinimi (SRS S4.2, S12.2) icin.

**4. Misafir sepeti localStorage'da.** `CartContext`, giris yapilmamiskan
sepeti `localStorage`'da tutar (SRS S4.7). Kayitli kullanici senkronizasyonu
(login aninda sepetin backend'e "merge" edilmesi) TODO olarak isaretli -
backend `/cart` uclari hazir olunca eklenecek.

## Backend ile acik/eksik noktalar (ekiple konusulmasi gereken)

- Kayit formunda "Uyelik Sozlesmesi" onayi (`terms_accepted`) backend'in
  alan listesinde yoktu, dokuman zorunlu olarak tanimliyor - frontend'de
  eklendi, backend'e de eklenmesi gerekiyor.
- `users` tablosunda (SRS S17.2) KVKK/uyelik sozlesmesi/e-bulten onaylarini
  saklayacak bir kolon tanimli degil - bu verinin nereye yazilacagi (ayri
  `consents` tablosu mu, `audit_logs` mu) netlesmedi.
- `/orders` uc noktasinin tam response sekli (S18.12'deki ornek disinda)
  backend'de henuz kodlanmadi - `src/api/orders.js` dokuman varsayimiyla
  yazildi, entegrasyonda kucuk duzeltmeler gerekebilir.

## Sayfa <-> route eslesmesi

| Route | Sayfa (SRS section) |
|---|---|
| `/` | Ana Sayfa (4.1) |
| `/kategori/:slug` | Kategori (4.2) |
| `/urun/:slug` | Urun Detayi (4.4) |
| `/arama` | Arama (4.5) |
| `/sepet` | Sepet (4.7) |
| `/odeme` | Siparis olusturma akisi (7.1) |
| `/giris`, `/uye-ol`, `/sifremi-unuttum` | 4.9, 4.10, 4.11 |
| `/profil`, `/adreslerim`, `/siparislerim`, `/favorilerim` | 4.12-4.14, 4.8 |
| `/iletisim`, `/hakkimizda`, `/sss` | 4.15-4.17 |
| `/kvkk`, `/mesafeli-satis-sozlesmesi`, `/iade-politikasi`, `/gizlilik-politikasi` | 4.18-4.21 |
