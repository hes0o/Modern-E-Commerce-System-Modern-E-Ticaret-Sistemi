import { Link } from "react-router-dom";
import { Minus, Plus, X } from "lucide-react";
import { useCart } from "../context/CartContext";
import { formatPrice } from "../lib/format";

// §4.7 Sepet
export default function CartPage() {
  const { lines, subtotal, loading, updateQuantity, removeItem } = useCart();

  if (loading) {
    return <div className="container-page py-24 text-center text-sm text-ink-soft">Sepet yükleniyor…</div>;
  }

  if (lines.length === 0) {
    return (
      <div className="container-page py-24 text-center">
        <h1 className="text-xl font-semibold">Sepetiniz boş</h1>
        <p className="mt-2 text-sm text-ink-soft">Alışverişe başlamak için ürünlere göz atın.</p>
        <Link to="/" className="btn-primary mt-6 inline-flex w-fit">Alışverişe Devam Et</Link>
      </div>
    );
  }

  return (
    <div className="container-page py-10">
      <h1 className="mb-8 text-2xl font-semibold">Sepetim</h1>

      <div className="grid gap-10 lg:grid-cols-3">
        <div className="lg:col-span-2 divide-y divide-line">
          {lines.map((line) => (
            <div key={line.itemId} className="flex gap-4 py-5">
              {line.image ? (
                <img src={line.image} alt={line.name} className="h-24 w-20 rounded-DEFAULT object-cover" />
              ) : (
                <div className="flex h-24 w-20 items-center justify-center rounded-DEFAULT bg-black/[0.04] text-[10px] text-ink-faint">
                  Görsel yok
                </div>
              )}
              <div className="flex flex-1 flex-col justify-between">
                <div className="flex justify-between">
                  <div>
                    <p className="text-sm font-medium">{line.name}</p>
                    {line.variantLabel && (
                      <p className="mt-0.5 text-xs text-ink-faint">{line.variantLabel}</p>
                    )}
                  </div>
                  <button
                    onClick={() => removeItem(line.itemId)}
                    className="h-fit text-ink-faint hover:text-danger"
                    aria-label="Kaldır"
                  >
                    <X size={16} />
                  </button>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center rounded-DEFAULT border border-line">
                    <button
                      onClick={() => updateQuantity(line.itemId, line.quantity - 1)}
                      className="flex h-8 w-8 items-center justify-center text-ink-soft"
                    >
                      <Minus size={12} />
                    </button>
                    <span className="w-6 text-center text-xs">{line.quantity}</span>
                    <button
                      onClick={() => updateQuantity(line.itemId, line.quantity + 1)}
                      className="flex h-8 w-8 items-center justify-center text-ink-soft"
                    >
                      <Plus size={12} />
                    </button>
                  </div>
                  <span className="font-mono text-sm">{formatPrice(line.lineTotal)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="h-fit rounded-lg border border-line p-6">
          <h2 className="mb-4 text-sm font-medium">Sipariş Özeti</h2>
          <div className="flex justify-between text-sm text-ink-soft">
            <span>Ara Toplam</span>
            <span className="font-mono">{formatPrice(subtotal)}</span>
          </div>
          <div className="mt-2 flex justify-between text-sm text-ink-soft">
            <span>Kargo</span>
            <span>Ücretsiz</span>
          </div>
          <div className="mt-4 flex justify-between border-t border-line pt-4 text-base font-medium">
            <span>Genel Toplam</span>
            <span className="font-mono">{formatPrice(subtotal)}</span>
          </div>
          <Link to="/odeme" className="btn-primary mt-6 w-full">Siparişi Tamamla</Link>
          <Link to="/" className="btn-ghost mt-2 w-full">Alışverişe Devam Et</Link>
        </div>
      </div>
    </div>
  );
}
