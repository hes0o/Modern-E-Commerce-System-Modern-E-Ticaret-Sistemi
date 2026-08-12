// src/data/mock.js
//
// Backend API'leri hazır olana kadar UI'yi geliştirebilmek için mock veri.
// Alan adları SRS §17.7 (products), §17.9 (variants), §17.5 (categories) ile
// TUTARLI tutuldu — böylece gerçek API'ye geçişte component'lerde değişiklik
// gerekmez, sadece src/api/*.js içindeki fetch çağrıları devreye girer.

export const mockCategories = [
  { id: 1, name: "Kadın", slug: "kadin", parent_id: null },
  { id: 2, name: "Erkek", slug: "erkek", parent_id: null },
  { id: 3, name: "Ayakkabı", slug: "ayakkabi", parent_id: null },
  { id: 4, name: "Aksesuar", slug: "aksesuar", parent_id: null },
];

export const mockBrands = [
  { id: 1, name: "Norda" },
  { id: 2, name: "Klein & Co" },
  { id: 3, name: "Urbane" },
];

function makeProduct(overrides) {
  return {
    id: overrides.id,
    name: overrides.name,
    slug: overrides.slug,
    brand: overrides.brand,
    category_id: overrides.category_id,
    price: overrides.price,
    discounted_price: overrides.discounted_price ?? null,
    description: overrides.description,
    cover_image: overrides.cover_image,
    gallery: overrides.gallery ?? [overrides.cover_image],
    tags: overrides.tags ?? [],
    stock_total: overrides.stock_total ?? 12,
    variants: overrides.variants ?? [
      { id: `${overrides.id}-1`, color: "Siyah", size: "M", stock: 6 },
      { id: `${overrides.id}-2`, color: "Siyah", size: "L", stock: 0 },
      { id: `${overrides.id}-3`, color: "Bej", size: "M", stock: 4 },
    ],
  };
}

export const mockProducts = [
  makeProduct({
    id: 101,
    name: "Oversize Yün Palto",
    slug: "oversize-yun-palto",
    brand: "Norda",
    category_id: 1,
    price: 3499,
    discounted_price: 2799,
    description:
      "Yumuşak dokulu yün karışımlı kumaştan, geniş kesim, astarlı palto.",
    cover_image: "https://picsum.photos/seed/palto/640/800",
    tags: ["Kampanyalı", "Yeni"],
    stock_total: 10,
  }),
  makeProduct({
    id: 102,
    name: "Klasik Deri Chelsea Bot",
    slug: "klasik-deri-chelsea-bot",
    brand: "Urbane",
    category_id: 3,
    price: 2199,
    description: "Gerçek deri, kauçuk taban, günlük kullanım için Chelsea bot.",
    cover_image: "https://picsum.photos/seed/bot/640/800",
    tags: ["Çok Satan"],
    stock_total: 3,
  }),
  makeProduct({
    id: 103,
    name: "Merserize Pamuk Gömlek",
    slug: "merserize-pamuk-gomlek",
    brand: "Klein & Co",
    category_id: 2,
    price: 899,
    description: "Parlak dokulu merserize pamuktan slim fit gömlek.",
    cover_image: "https://picsum.photos/seed/gomlek/640/800",
    tags: [],
    stock_total: 0,
  }),
  makeProduct({
    id: 104,
    name: "Minimal Deri Kemer",
    slug: "minimal-deri-kemer",
    brand: "Urbane",
    category_id: 4,
    price: 549,
    discounted_price: 429,
    description: "Tam tane deri, sadeleştirilmiş toka tasarımlı kemer.",
    cover_image: "https://picsum.photos/seed/kemer/640/800",
    tags: ["Kampanyalı"],
    stock_total: 22,
  }),
  makeProduct({
    id: 105,
    name: "Yüksek Bel Straight Jean",
    slug: "yuksek-bel-straight-jean",
    brand: "Norda",
    category_id: 1,
    price: 1249,
    description: "Ağır gramajlı denim, yüksek bel, straight kesim.",
    cover_image: "https://picsum.photos/seed/jean/640/800",
    tags: ["Yeni"],
    stock_total: 15,
  }),
  makeProduct({
    id: 106,
    name: "Kaşmir Karışımlı Atkı",
    slug: "kasmir-karisimli-atki",
    brand: "Klein & Co",
    category_id: 4,
    price: 649,
    description: "Yumuşak dokulu, %30 kaşmir karışımlı örgü atkı.",
    cover_image: "https://picsum.photos/seed/atki/640/800",
    tags: ["Öne Çıkan"],
    stock_total: 8,
  }),
];

export const mockFaq = [
  {
    question: "Siparişim ne zaman kargoya verilir?",
    answer:
      "Siparişiniz onaylandıktan sonra ortalama 1-2 iş günü içinde kargoya teslim edilir.",
  },
  {
    question: "İade süresi ne kadar?",
    answer:
      "Ürünü teslim aldığınız tarihten itibaren 14 gün içinde iade talebinde bulunabilirsiniz.",
  },
  {
    question: "Kapıda ödeme seçeneği var mı?",
    answer: "Evet, kapıda ödeme ve havale/EFT bildirim seçenekleriyle sipariş verebilirsiniz.",
  },
];
