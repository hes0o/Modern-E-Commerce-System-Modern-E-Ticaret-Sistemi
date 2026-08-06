import { Link } from "react-router-dom";
import { Heart, ShoppingBag } from "lucide-react";
import { formatPrice } from "../../lib/format";
import Badge from "../common/Badge";
import { useCart } from "../../context/CartContext";

// §4.3 Ürün Listeleme — Ürün kartı: kapak görseli, ürün adı, marka,
// fiyat/indirimli fiyat, "Sepete Ekle" kısayol butonu, favoriye ekle ikonu.
export default function ProductCard({ product }) {
  const { addItem } = useCart();
  const inStock = product.stock_total > 0;
  const hasDiscount = product.discounted_price != null;
  const defaultVariant = product.variants.find((v) => v.stock > 0) || product.variants[0];
  // Backend'de varyant listesi henüz yok (bkz. api/normalize.js) — varyantlı
  // ürünlerde hangi varyantın ekleneceği bilinmediği için hızlı ekle kapatılır.
  const canQuickAdd = inStock && (!product.has_variants || defaultVariant);

  function handleQuickAdd(e) {
    e.preventDefault();
    if (!canQuickAdd) return;
    // §4.3: "varyant seçilmeden sepete ekleme yapılabiliyorsa varsayılan
    // varyant kuralının uygulanması"
    addItem(product.id, defaultVariant?.id ?? null, 1);
  }

  return (
    <Link to={`/urun/${product.id}-${product.slug}`} className="group block">
      <div className="relative overflow-hidden rounded-lg bg-black/[0.03]">
        {product.cover_image ? (
          <img
            src={product.cover_image}
            alt={product.name}
            className="aspect-[4/5] w-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
          />
        ) : (
          <div className="flex aspect-[4/5] w-full items-center justify-center text-xs text-ink-faint">
            Görsel yok
          </div>
        )}

        <div className="absolute left-2.5 top-2.5 flex flex-col gap-1.5">
          {product.tags.map((tag) => (
            <Badge key={tag} variant={tag === "Kampanyalı" ? "accent" : "neutral"}>
              {tag}
            </Badge>
          ))}
          {!inStock && <Badge variant="danger">Stokta Yok</Badge>}
        </div>

        <button
          type="button"
          aria-label="Favorilere ekle"
          className="absolute right-2.5 top-2.5 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-ink-soft opacity-0 shadow-card transition-opacity hover:text-accent group-hover:opacity-100 focus-visible:opacity-100"
          onClick={(e) => e.preventDefault()}
        >
          <Heart size={16} />
        </button>

        <button
          type="button"
          onClick={handleQuickAdd}
          disabled={!canQuickAdd}
          className="absolute inset-x-2.5 bottom-2.5 flex translate-y-2 items-center justify-center gap-1.5 rounded-DEFAULT bg-ink py-2 text-xs font-medium text-white opacity-0 transition-all duration-200 group-hover:translate-y-0 group-hover:opacity-100 disabled:cursor-not-allowed disabled:bg-black/20"
        >
          <ShoppingBag size={14} />
          {inStock ? "Sepete Ekle" : "Stokta Yok"}
        </button>
      </div>

      <div className="mt-3">
        <p className="text-xs text-ink-faint">{product.brand}</p>
        <h3 className="mt-0.5 text-sm text-ink">{product.name}</h3>
        <div className="mt-1 flex items-center gap-2 font-mono text-sm">
          {hasDiscount ? (
            <>
              <span className="text-ink">{formatPrice(product.discounted_price)}</span>
              <span className="text-ink-faint line-through">{formatPrice(product.price)}</span>
            </>
          ) : (
            <span className="text-ink">{formatPrice(product.price)}</span>
          )}
        </div>
      </div>
    </Link>
  );
}
