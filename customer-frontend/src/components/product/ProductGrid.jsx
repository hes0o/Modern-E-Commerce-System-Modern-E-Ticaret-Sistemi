import ProductCard from "./ProductCard";
import SkeletonCard from "../common/SkeletonCard";

// §4.5: "Arama sonuç sayfası (ürün listeleme bileşeninin yeniden kullanımı)"
// §4.8: Favoriler de aynı bileşeni kullanır — bu yüzden ortak/reusable tutuldu.
export default function ProductGrid({ products, loading, emptyMessage = "Ürün bulunamadı." }) {
  if (loading) {
    return (
      <div className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 lg:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    );
  }

  if (!products.length) {
    return (
      <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-line py-20 text-center">
        <p className="text-sm text-ink-soft">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 lg:grid-cols-4">
      {products.map((p) => (
        <ProductCard key={p.id} product={p} />
      ))}
    </div>
  );
}
