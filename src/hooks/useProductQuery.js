import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { mockProducts } from "../data/mock";
import * as productsApi from "../api/products";
import { normalizeApiProduct } from "../api/normalize";

const USE_MOCK = import.meta.env.VITE_USE_MOCK === "true";

// §4.2 / §12.2: filtre/sıralama parametreleri URL query string'de tutulur.
//
// ÖNEMLİ (gerçek backend okunduktan sonra): backend'in GET /api/products
// uç noktası sadece page, page_size, search, category_id parametrelerini
// destekliyor — fiyat aralığı, marka, stok/indirim filtresi ve sıralama
// BACKEND'DE YOK. Bu yüzden:
//   - VITE_USE_MOCK=true  -> tüm filtreler mockProducts üzerinde client-side çalışır
//   - VITE_USE_MOCK=false -> sadece arama + kategori backend'e gider, geri
//     kalan filtre UI'ları görünür ama devre dışı bırakılır (bkz. FilterPanel
//     kullanan sayfalardaki "backend henüz desteklemiyor" notu)
export function useProductQuery({ categoryId, searchQuery } = {}) {
  const [searchParams, setSearchParams] = useSearchParams();
  const [apiProducts, setApiProducts] = useState([]);
  const [loading, setLoading] = useState(!USE_MOCK);

  const filters = {
    brand: searchParams.get("brand") || undefined,
    minPrice: searchParams.get("minPrice") || undefined,
    maxPrice: searchParams.get("maxPrice") || undefined,
    inStockOnly: searchParams.get("inStockOnly") || undefined,
    discountedOnly: searchParams.get("discountedOnly") || undefined,
    sort: searchParams.get("sort") || undefined,
  };

  function setFilters(next) {
    const params = new URLSearchParams();
    if (searchQuery) params.set("q", searchQuery);
    Object.entries(next).forEach(([key, value]) => {
      if (value) params.set(key, value);
    });
    setSearchParams(params);
  }

  useEffect(() => {
    if (USE_MOCK) return;
    let cancelled = false;
    setLoading(true);
    productsApi
      .getProducts({ categoryId, search: searchQuery, page: 1, pageSize: 24 })
      .then((res) => {
        if (!cancelled) setApiProducts((res?.items || []).map(normalizeApiProduct));
      })
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [categoryId, searchQuery]);

  const products = useMemo(() => {
    if (!USE_MOCK) return apiProducts;

    let list = [...mockProducts];
    if (categoryId) list = list.filter((p) => p.category_id === categoryId);

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.brand.toLowerCase().includes(q) ||
          p.tags.some((t) => t.toLowerCase().includes(q))
      );
    }

    if (filters.brand) list = list.filter((p) => p.brand === filters.brand);
    if (filters.minPrice) list = list.filter((p) => (p.discounted_price ?? p.price) >= Number(filters.minPrice));
    if (filters.maxPrice) list = list.filter((p) => (p.discounted_price ?? p.price) <= Number(filters.maxPrice));
    if (filters.inStockOnly) list = list.filter((p) => p.stock_total > 0);
    if (filters.discountedOnly) list = list.filter((p) => p.discounted_price != null);

    if (filters.sort === "price_asc") list.sort((a, b) => (a.discounted_price ?? a.price) - (b.discounted_price ?? b.price));
    if (filters.sort === "price_desc") list.sort((a, b) => (b.discounted_price ?? b.price) - (a.discounted_price ?? a.price));

    return list;
  }, [categoryId, searchQuery, apiProducts, JSON.stringify(filters)]);

  return { products, filters, setFilters, loading, filtersSupported: USE_MOCK };
}
