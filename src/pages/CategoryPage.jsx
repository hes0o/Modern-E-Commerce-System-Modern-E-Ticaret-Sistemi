import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { mockCategories } from "../data/mock";
import * as categoriesApi from "../api/categories";
import { useProductQuery } from "../hooks/useProductQuery";
import { parseIdFromIdSlug } from "../lib/idSlug";
import FilterPanel from "../components/filters/FilterPanel";
import ProductGrid from "../components/product/ProductGrid";

const USE_MOCK = import.meta.env.VITE_USE_MOCK === "true";

// §4.2 Kategori Sayfası
export default function CategoryPage() {
  const { idSlug } = useParams();
  const categoryId = parseIdFromIdSlug(idSlug);

  const [category, setCategory] = useState(
    USE_MOCK ? mockCategories.find((c) => c.id === categoryId) : null
  );

  useEffect(() => {
    if (USE_MOCK || !categoryId) return;
    categoriesApi.getCategoryById(categoryId).then(setCategory);
  }, [categoryId]);

  const { products, filters, setFilters, loading, filtersSupported } = useProductQuery({ categoryId });

  return (
    <div className="container-page py-10">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold">{category?.name || "Kategori"}</h1>
        <p className="mt-1 text-sm text-ink-soft">{products.length} ürün</p>
      </div>

      {!filtersSupported && (
        <p className="mb-5 rounded-DEFAULT bg-black/[0.03] px-3.5 py-2.5 text-xs text-ink-soft">
          Fiyat/marka filtreleri ve sıralama şu an backend tarafından desteklenmiyor.
        </p>
      )}

      <div className="flex flex-col gap-8 lg:flex-row">
        <FilterPanel filters={filters} onChange={setFilters} />

        <div className="flex-1">
          {filtersSupported && (
            <div className="mb-5 flex justify-end">
              <select
                value={filters.sort || ""}
                onChange={(e) => setFilters({ ...filters, sort: e.target.value || undefined })}
                className="input w-auto py-1.5 text-sm"
              >
                <option value="">Önerilen Sıralama</option>
                <option value="price_asc">Fiyat: Düşükten Yükseğe</option>
                <option value="price_desc">Fiyat: Yüksekten Düşüğe</option>
              </select>
            </div>
          )}
          <ProductGrid products={products} loading={loading} />
        </div>
      </div>
    </div>
  );
}
