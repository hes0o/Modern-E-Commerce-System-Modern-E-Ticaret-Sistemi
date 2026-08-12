import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { mockCategories, mockProducts } from "../data/mock";
import ProductGrid from "../components/product/ProductGrid";

// §4.1 Ana Sayfa
export default function HomePage() {
  const featured = mockProducts.filter((p) => p.tags.includes("Öne Çıkan") || p.tags.length > 0);
  const bestSellers = mockProducts.filter((p) => p.tags.includes("Çok Satan"));
  const newArrivals = mockProducts.filter((p) => p.tags.includes("Yeni"));
  const onSale = mockProducts.filter((p) => p.discounted_price != null);

  return (
    <div>
      {/* Ana banner / slider alanı */}
      <section className="border-b border-line bg-ink">
        <div className="container-page grid items-center gap-10 py-16 lg:grid-cols-2 lg:py-24">
          <div>
            <p className="mb-3 font-mono text-xs uppercase tracking-widest text-white/50">
              Yeni Sezon
            </p>
            <h1 className="font-display text-4xl font-semibold leading-[1.1] text-white lg:text-5xl">
              Kışa hazır bir
              <br />
              gardırop kurun.
            </h1>
            <p className="mt-4 max-w-md text-white/70">
              Seçilmiş dış giyim ve aksesuarlarda %20&apos;ye varan indirim, sınırlı stokla.
            </p>
            <Link to="/kategori/1-kadin" className="btn-primary mt-7 w-fit">
              Koleksiyonu Keşfet <ArrowRight size={16} />
            </Link>
          </div>
          <img
            src="https://picsum.photos/seed/hero/700/560"
            alt="Yeni sezon koleksiyonu"
            className="hidden aspect-[5/4] w-full rounded-lg object-cover lg:block"
          />
        </div>
      </section>

      {/* Öne çıkan kategoriler bloğu */}
      <section className="container-page py-14">
        <h2 className="mb-6 text-xl font-semibold">Kategoriler</h2>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {mockCategories.map((c) => (
            <Link
              key={c.id}
              to={`/kategori/${c.id}-${c.slug}`}
              className="group relative overflow-hidden rounded-lg"
            >
              <img
                src={`https://picsum.photos/seed/cat-${c.id}/400/500`}
                alt={c.name}
                className="aspect-[4/5] w-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
              <span className="absolute bottom-3 left-3 font-display text-sm font-medium text-white">
                {c.name}
              </span>
            </Link>
          ))}
        </div>
      </section>

      {onSale.length > 0 && (
        <ProductSection title="Kampanyalı Ürünler" products={onSale} viewAllTo="/kategori/1-kadin" />
      )}
      {bestSellers.length > 0 && (
        <ProductSection title="Çok Satanlar" products={bestSellers} viewAllTo="/kategori/3-ayakkabi" />
      )}
      {newArrivals.length > 0 && (
        <ProductSection title="Yeni Ürünler" products={newArrivals} viewAllTo="/kategori/1-kadin" />
      )}
      {featured.length === 0 && bestSellers.length === 0 && (
        <div className="container-page py-14">
          <ProductGrid products={mockProducts} loading={false} />
        </div>
      )}
    </div>
  );
}

function ProductSection({ title, products, viewAllTo }) {
  return (
    <section className="container-page border-t border-line py-14">
      <div className="mb-6 flex items-end justify-between">
        <h2 className="text-xl font-semibold">{title}</h2>
        <Link to={viewAllTo} className="text-sm text-primary hover:text-primary-hover">
          Tümünü Gör
        </Link>
      </div>
      <ProductGrid products={products} loading={false} />
    </section>
  );
}
