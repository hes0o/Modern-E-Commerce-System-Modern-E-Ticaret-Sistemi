import { mockProducts } from "../data/mock";
import ProductGrid from "../components/product/ProductGrid";

// §4.8 Favoriler — "Favori ürün kartları (ürün listeleme bileşeninin yeniden kullanımı)"
// TODO(backend): getFavorites() hazır olunca mock'un yerini alacak.
export default function FavoritesPage() {
  const favorites = mockProducts.slice(0, 3);

  return (
    <div>
      <h1 className="mb-6 text-xl font-semibold">Favorilerim</h1>
      <ProductGrid
        products={favorites}
        loading={false}
        emptyMessage="Henüz favori ürününüz yok."
      />
    </div>
  );
}
