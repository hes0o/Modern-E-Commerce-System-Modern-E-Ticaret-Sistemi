import { useEffect, useMemo, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Heart, Share2, Minus, Plus } from "lucide-react";
import { mockProducts } from "../data/mock";
import * as productsApi from "../api/products";
import { normalizeApiProduct } from "../api/normalize";
import { parseIdFromIdSlug } from "../lib/idSlug";
import { formatPrice } from "../lib/format";
import Badge from "../components/common/Badge";
import ProductGrid from "../components/product/ProductGrid";
import { useCart } from "../context/CartContext";

const USE_MOCK = import.meta.env.VITE_USE_MOCK === "true";

// §4.4 Ürün Detayı
export default function ProductDetailPage() {
  const { idSlug } = useParams();
  const productId = parseIdFromIdSlug(idSlug);
  const { addItem } = useCart();

  const [product, setProduct] = useState(
    USE_MOCK ? mockProducts.find((p) => p.id === productId) : null
  );
  const [loading, setLoading] = useState(!USE_MOCK);

  useEffect(() => {
    if (USE_MOCK || !productId) return;
    setLoading(true);
    productsApi
      .getProductById(productId)
      .then((res) => setProduct(normalizeApiProduct(res)))
      .finally(() => setLoading(false));
  }, [productId]);

  const colors = useMemo(
    () => (product?.variants?.length ? [...new Set(product.variants.map((v) => v.color))] : []),
    [product]
  );
  const sizes = useMemo(
    () => (product?.variants?.length ? [...new Set(product.variants.map((v) => v.size))] : []),
    [product]
  );

  const [selectedColor, setSelectedColor] = useState();
  const [selectedSize, setSelectedSize] = useState();
  const [quantity, setQuantity] = useState(1);
  const [activeImage, setActiveImage] = useState(0);
  const [added, setAdded] = useState(false);

  useEffect(() => {
    if (colors.length && !selectedColor) setSelectedColor(colors[0]);
    if (sizes.length && !selectedSize) setSelectedSize(sizes[0]);
  }, [colors, sizes]);

  useEffect(() => {
    if (product) document.title = `${product.name} | Norda`; // §4.4 SEO meta bilgileri
  }, [product]);

  if (loading) {
    return <div className="container-page py-24 text-center text-sm text-ink-soft">Ürün yükleniyor…</div>;
  }

  if (!product) {
    return (
      <div className="container-page py-24 text-center">
        <p className="text-ink-soft">Ürün bulunamadı.</p>
        <Link to="/" className="mt-3 inline-block text-primary">Ana sayfaya dön</Link>
      </div>
    );
  }

  const hasVariantData = product.variants && product.variants.length > 0;
  const selectedVariant = hasVariantData
    ? product.variants.find((v) => v.color === selectedColor && v.size === selectedSize)
    : null;
  const isInStock = hasVariantData ? (selectedVariant?.stock ?? 0) > 0 : product.stock_total > 0;
  const hasDiscount = product.discounted_price != null;
  const gallery = product.gallery?.length ? product.gallery : product.cover_image ? [product.cover_image] : [];
  const related = mockProducts.filter(
    (p) => p.category_id === product.category_id && p.id !== product.id
  );

  function handleAddToCart() {
    if (!isInStock) return;
    if (hasVariantData && !selectedVariant) return;
    addItem(product.id, selectedVariant?.id ?? null, quantity);
    setAdded(true);
    setTimeout(() => setAdded(false), 1800);
  }

  return (
    <div className="container-page py-10">
      <div className="grid gap-10 lg:grid-cols-2">
        {/* Görsel galeri */}
        <div>
          <div className="overflow-hidden rounded-lg bg-black/[0.03]">
            {gallery.length > 0 ? (
              <img
                src={gallery[activeImage]}
                alt={product.name}
                className="aspect-[4/5] w-full object-cover"
              />
            ) : (
              <div className="flex aspect-[4/5] w-full items-center justify-center text-sm text-ink-faint">
                Görsel yok
              </div>
            )}
          </div>
          {gallery.length > 1 && (
            <div className="mt-3 flex gap-2">
              {gallery.map((img, i) => (
                <button
                  key={img + i}
                  onClick={() => setActiveImage(i)}
                  className={`h-16 w-16 overflow-hidden rounded-DEFAULT border ${
                    activeImage === i ? "border-ink" : "border-line"
                  }`}
                >
                  <img src={img} alt="" className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Bilgi */}
        <div>
          <div className="mb-2 flex flex-wrap gap-1.5">
            {product.tags.map((t) => (
              <Badge key={t} variant={t === "Kampanyalı" ? "accent" : "neutral"}>{t}</Badge>
            ))}
          </div>

          {product.brand && <p className="text-sm text-ink-faint">{product.brand}</p>}
          <h1 className="mt-1 font-display text-2xl font-semibold">{product.name}</h1>

          <div className="mt-3 flex items-center gap-2 font-mono text-lg">
            {hasDiscount ? (
              <>
                <span>{formatPrice(product.discounted_price)}</span>
                <span className="text-base text-ink-faint line-through">{formatPrice(product.price)}</span>
              </>
            ) : (
              <span>{formatPrice(product.price)}</span>
            )}
            <span className="ml-1 text-xs font-body text-ink-faint">KDV Dahil</span>
          </div>

          <p className="mt-4 text-sm leading-relaxed text-ink-soft">{product.description}</p>

          {/* Varyant seçici — backend varyant listesi döndürüyorsa gösterilir */}
          {hasVariantData ? (
            <>
              <div className="mt-6">
                <p className="label">Renk: {selectedColor}</p>
                <div className="flex gap-2">
                  {colors.map((c) => (
                    <button
                      key={c}
                      onClick={() => setSelectedColor(c)}
                      className={`rounded-DEFAULT border px-3 py-1.5 text-xs ${
                        selectedColor === c ? "border-ink bg-ink text-white" : "border-line text-ink-soft"
                      }`}
                    >
                      {c}
                    </button>
                  ))}
                </div>
              </div>

              <div className="mt-4">
                <p className="label">Beden</p>
                <div className="flex gap-2">
                  {sizes.map((s) => {
                    const variant = product.variants.find((v) => v.color === selectedColor && v.size === s);
                    const disabled = !variant || variant.stock === 0;
                    return (
                      <button
                        key={s}
                        disabled={disabled}
                        onClick={() => setSelectedSize(s)}
                        className={`h-10 w-10 rounded-DEFAULT border text-xs ${
                          disabled
                            ? "cursor-not-allowed border-line text-ink-faint line-through"
                            : selectedSize === s
                            ? "border-ink bg-ink text-white"
                            : "border-line text-ink-soft"
                        }`}
                      >
                        {s}
                      </button>
                    );
                  })}
                </div>
              </div>
            </>
          ) : (
            product.has_variants && (
              <p className="mt-4 text-xs text-ink-faint">
                Bu ürünün varyantları var ancak backend henüz varyant detaylarını döndürmüyor.
              </p>
            )
          )}

          <p className="mt-4 text-xs text-ink-soft">
            {isInStock
              ? hasVariantData && selectedVariant?.stock <= 3
                ? `Son ${selectedVariant.stock} ürün`
                : "Stokta var"
              : "Stokta yok"}
          </p>

          <div className="mt-5 flex items-center gap-3">
            <div className="flex items-center rounded-DEFAULT border border-line">
              <button
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                className="flex h-10 w-10 items-center justify-center text-ink-soft hover:text-ink"
              >
                <Minus size={14} />
              </button>
              <span className="w-8 text-center text-sm">{quantity}</span>
              <button
                onClick={() => setQuantity((q) => q + 1)}
                className="flex h-10 w-10 items-center justify-center text-ink-soft hover:text-ink"
              >
                <Plus size={14} />
              </button>
            </div>

            <button
              onClick={handleAddToCart}
              disabled={!isInStock}
              className="btn-primary h-10 flex-1"
            >
              {added ? "Sepete Eklendi ✓" : "Sepete Ekle"}
            </button>

            <button className="btn-outline h-10 w-10 p-0" aria-label="Favorilere ekle">
              <Heart size={16} />
            </button>
            <button className="btn-outline h-10 w-10 p-0" aria-label="Paylaş">
              <Share2 size={16} />
            </button>
          </div>
        </div>
      </div>

      {related.length > 0 && (
        <section className="mt-20 border-t border-line pt-10">
          <h2 className="mb-6 text-xl font-semibold">Benzer Ürünler</h2>
          <ProductGrid products={related} loading={false} />
        </section>
      )}
    </div>
  );
}
