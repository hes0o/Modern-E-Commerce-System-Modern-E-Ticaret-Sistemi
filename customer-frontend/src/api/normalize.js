// src/api/normalize.js
//
// Backend'in gerçek ProductResponse şeması (app/schemas/product.py) ile
// UI component'lerinin beklediği şekil arasında köprü. İki KRİTİK backend
// eksikliği burada ortaya çıkıyor, ekiple konuşulması gerekiyor:
//
//   1. ÜRÜN GÖRSELİ YOK — ProductResponse'da hiçbir image/gallery alanı
//      yok. Muhtemelen ayrı bir "product_images" tablosu/uç noktası
//      planlanıyor ama henüz açılmamış. Şimdilik placeholder gösteriliyor.
//   2. VARYANT LİSTESİ YOK — sadece `has_variants: bool` var, renk/beden/
//      stok kırılımını dönen bir alan/uç nokta yok. Varyant seçici UI'ı bu
//      yüzden gerçek modda devre dışı kalıyor.
export function normalizeApiProduct(p) {
  const tags = [
    p.is_campaign && "Kampanyalı",
    p.is_bestseller && "Çok Satan",
    p.is_new && "Yeni",
    p.is_featured && "Öne Çıkan",
  ].filter(Boolean);

  return {
    id: p.id,
    name: p.name,
    slug: p.slug,
    brand: p.brand_id ? `Marka #${p.brand_id}` : "", // TODO(backend): marka adı response'da yok, sadece brand_id
    category_id: p.category_id,
    price: p.price,
    discounted_price: p.discount_price,
    description: p.short_description,
    cover_image: null, // TODO(backend): görsel alanı yok
    gallery: [],
    tags,
    stock_total: p.stock ?? 0,
    has_variants: p.has_variants,
    variants: [], // TODO(backend): varyant listesi endpoint'i yok
  };
}
