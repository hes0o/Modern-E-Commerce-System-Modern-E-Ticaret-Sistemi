import { X } from "lucide-react";
import { mockBrands } from "../../data/mock";

// §12 Filtreleme — fiyat aralığı, kategori/marka, renk/beden, stok/indirim.
// §12.2: seçili filtre kombinasyonu URL query string'e yansıtılır — bu state
// yönetimi sayfa bileşeninde (CategoryPage) useSearchParams ile yapılır,
// FilterPanel yalnızca "controlled" bir görünüm bileşenidir.
export default function FilterPanel({ filters, onChange }) {
  const activeChips = Object.entries(filters).filter(([, v]) => v);

  function set(key, value) {
    onChange({ ...filters, [key]: value });
  }

  function clearAll() {
    onChange({});
  }

  return (
    <aside className="w-full shrink-0 lg:w-64">
      {activeChips.length > 0 && (
        <div className="mb-4 flex flex-wrap gap-1.5">
          {activeChips.map(([key, value]) => (
            <button
              key={key}
              onClick={() => set(key, undefined)}
              className="flex items-center gap-1 rounded-sm bg-primary-soft px-2 py-1 text-xs text-primary"
            >
              {value}
              <X size={12} />
            </button>
          ))}
          <button onClick={clearAll} className="text-xs text-ink-soft underline underline-offset-2">
            Tümünü temizle
          </button>
        </div>
      )}

      <div className="space-y-6">
        <div>
          <h4 className="mb-2.5 text-sm font-medium">Fiyat Aralığı</h4>
          <div className="flex items-center gap-2">
            <input
              type="number"
              placeholder="Min"
              className="input py-1.5 text-xs"
              value={filters.minPrice || ""}
              onChange={(e) => set("minPrice", e.target.value)}
            />
            <span className="text-ink-faint">—</span>
            <input
              type="number"
              placeholder="Max"
              className="input py-1.5 text-xs"
              value={filters.maxPrice || ""}
              onChange={(e) => set("maxPrice", e.target.value)}
            />
          </div>
        </div>

        <div>
          <h4 className="mb-2.5 text-sm font-medium">Marka</h4>
          <div className="space-y-2">
            {mockBrands.map((b) => (
              <label key={b.id} className="flex items-center gap-2 text-sm text-ink-soft">
                <input
                  type="checkbox"
                  className="h-4 w-4 rounded border-line text-primary focus:ring-primary"
                  checked={filters.brand === b.name}
                  onChange={(e) => set("brand", e.target.checked ? b.name : undefined)}
                />
                {b.name}
              </label>
            ))}
          </div>
        </div>

        <div>
          <h4 className="mb-2.5 text-sm font-medium">Durum</h4>
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm text-ink-soft">
              <input
                type="checkbox"
                className="h-4 w-4 rounded border-line text-primary focus:ring-primary"
                checked={!!filters.inStockOnly}
                onChange={(e) => set("inStockOnly", e.target.checked ? "Stokta Olanlar" : undefined)}
              />
              Sadece stokta olanlar
            </label>
            <label className="flex items-center gap-2 text-sm text-ink-soft">
              <input
                type="checkbox"
                className="h-4 w-4 rounded border-line text-primary focus:ring-primary"
                checked={!!filters.discountedOnly}
                onChange={(e) => set("discountedOnly", e.target.checked ? "İndirimli" : undefined)}
              />
              İndirimli ürünler
            </label>
          </div>
        </div>
      </div>
    </aside>
  );
}
