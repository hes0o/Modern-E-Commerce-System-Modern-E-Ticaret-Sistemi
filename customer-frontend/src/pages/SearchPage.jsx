import { useSearchParams } from "react-router-dom";
import { useProductQuery } from "../hooks/useProductQuery";
import FilterPanel from "../components/filters/FilterPanel";
import ProductGrid from "../components/product/ProductGrid";

// §4.5 Arama — "Arama sonuç sayfası (ürün listeleme bileşeninin yeniden kullanımı)"
export default function SearchPage() {
  const [searchParams] = useSearchParams();
  const q = searchParams.get("q") || "";
  const { products, filters, setFilters, loading, filtersSupported } = useProductQuery({ searchQuery: q });

  return (
    <div className="container-page py-10">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold">"{q}" için sonuçlar</h1>
        <p className="mt-1 text-sm text-ink-soft">{products.length} ürün bulundu</p>
      </div>

      {!filtersSupported && (
        <p className="mb-5 rounded-DEFAULT bg-black/[0.03] px-3.5 py-2.5 text-xs text-ink-soft">
          Fiyat/marka filtreleri ve sıralama şu an backend tarafından desteklenmiyor.
        </p>
      )}

      <div className="flex flex-col gap-8 lg:flex-row">
        <FilterPanel filters={filters} onChange={setFilters} />
        <div className="flex-1">
          <ProductGrid
            products={products}
            loading={loading}
            emptyMessage="Aramanızla eşleşen ürün bulunamadı. İlginizi çekebilecek diğer ürünlere göz atın."
          />
        </div>
      </div>
    </div>
  );
}
