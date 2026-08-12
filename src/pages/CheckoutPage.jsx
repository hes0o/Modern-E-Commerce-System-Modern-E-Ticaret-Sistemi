import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { formatPrice } from "../lib/format";
import * as ordersApi from "../api/orders";

// §7.1 Sipariş Oluşturma Akışı (Frontend):
// 1) Sepet Onayı  2) Adres Seçimi  3) Teslimat/Not  4) Sözleşme Onayı  5) Sipariş Onayı
const savedAddresses = [
  { id: 1, title: "Ev", line: "Bağdat Cd. No: 120 D: 4, Kadıköy / İstanbul" },
];

export default function CheckoutPage() {
  const { lines, subtotal, clear } = useCart();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [addressId, setAddressId] = useState(isAuthenticated ? savedAddresses[0]?.id : null);
  const [guestAddress, setGuestAddress] = useState({ recipient: "", line: "", city: "", district: "", phone: "" });
  const [note, setNote] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("cod"); // §2.4: online ödeme MVP kapsamı dışı
  const [distanceSalesAccepted, setDistanceSalesAccepted] = useState(false);
  const [kvkkAccepted, setKvkkAccepted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const canSubmit =
    lines.length > 0 &&
    (isAuthenticated ? !!addressId : guestAddress.line && guestAddress.recipient) &&
    distanceSalesAccepted &&
    kvkkAccepted;

  async function handleSubmit() {
    if (!canSubmit) return;
    setSubmitting(true);
    setError("");
    try {
      const order = await ordersApi.createOrder({
        addressId: isAuthenticated ? addressId : undefined,
        guestAddress: isAuthenticated ? undefined : guestAddress,
        paymentMethod,
        customerNote: note || undefined,
        // §7.1 Adım 4: Mesafeli Satış Sözleşmesi + KVKK ayrı onaylanır, backend'e
        // "sözleşme kabul edildi" olarak tek bir alanla iletiliyor (§18.12)
        contractAccepted: distanceSalesAccepted && kvkkAccepted,
      });
      clear();
      navigate(`/siparis-onay/${order.order_number}`, { state: { order } });
    } catch (err) {
      if (err.status === 409) {
        setError("Sepetinizdeki bazı ürünlerin stoğu yetersiz. Lütfen sepetinizi güncelleyin.");
      } else {
        setError("Sipariş oluşturulurken bir hata oluştu. Lütfen tekrar deneyin.");
      }
    } finally {
      setSubmitting(false);
    }
  }

  if (lines.length === 0) {
    return (
      <div className="container-page py-24 text-center">
        <p className="text-ink-soft">Sepetiniz boş, ödeme adımına geçemezsiniz.</p>
      </div>
    );
  }

  return (
    <div className="container-page py-10">
      <h1 className="mb-8 text-2xl font-semibold">Siparişi Tamamla</h1>

      <div className="grid gap-10 lg:grid-cols-3">
        <div className="space-y-8 lg:col-span-2">
          {/* 1. Adım — Sepet Onayı */}
          <section>
            <h2 className="mb-3 text-sm font-medium">1. Sepetinizi Gözden Geçirin</h2>
            <div className="divide-y divide-line rounded-lg border border-line">
              {lines.map((line) => (
                <div key={line.itemId} className="flex items-center justify-between px-4 py-3">
                  <div>
                    <p className="text-sm">{line.name}</p>
                    {line.variantLabel && (
                      <p className="text-xs text-ink-faint">
                        {line.variantLabel} · Adet: {line.quantity}
                      </p>
                    )}
                  </div>
                  <span className="font-mono text-sm">{formatPrice(line.lineTotal)}</span>
                </div>
              ))}
            </div>
          </section>

          {/* 2. Adım — Adres Seçimi */}
          <section>
            <h2 className="mb-3 text-sm font-medium">2. Teslimat Adresi</h2>
            {isAuthenticated ? (
              <div className="space-y-2">
                {savedAddresses.map((a) => (
                  <label
                    key={a.id}
                    className={`flex cursor-pointer items-start gap-3 rounded-DEFAULT border p-3 text-sm ${
                      addressId === a.id ? "border-ink" : "border-line"
                    }`}
                  >
                    <input
                      type="radio"
                      name="address"
                      checked={addressId === a.id}
                      onChange={() => setAddressId(a.id)}
                      className="mt-1"
                    />
                    <div>
                      <p className="font-medium">{a.title}</p>
                      <p className="text-ink-soft">{a.line}</p>
                    </div>
                  </label>
                ))}
              </div>
            ) : (
              <div className="grid gap-3 sm:grid-cols-2">
                <input
                  className="input sm:col-span-2"
                  placeholder="Ad Soyad"
                  value={guestAddress.recipient}
                  onChange={(e) => setGuestAddress({ ...guestAddress, recipient: e.target.value })}
                />
                <input
                  className="input sm:col-span-2"
                  placeholder="Açık Adres"
                  value={guestAddress.line}
                  onChange={(e) => setGuestAddress({ ...guestAddress, line: e.target.value })}
                />
                <input
                  className="input"
                  placeholder="İl"
                  value={guestAddress.city}
                  onChange={(e) => setGuestAddress({ ...guestAddress, city: e.target.value })}
                />
                <input
                  className="input"
                  placeholder="İlçe"
                  value={guestAddress.district}
                  onChange={(e) => setGuestAddress({ ...guestAddress, district: e.target.value })}
                />
                <input
                  className="input sm:col-span-2"
                  placeholder="Telefon"
                  value={guestAddress.phone}
                  onChange={(e) => setGuestAddress({ ...guestAddress, phone: e.target.value })}
                />
              </div>
            )}
          </section>

          {/* 3. Adım — Teslimat/Not + Ödeme Yöntemi */}
          <section>
            <h2 className="mb-3 text-sm font-medium">3. Ödeme Yöntemi ve Sipariş Notu</h2>
            <div className="mb-4 flex gap-3">
              {[
                { value: "cod", label: "Kapıda Ödeme" },
                { value: "bank_transfer", label: "Havale / EFT" },
              ].map((opt) => (
                <label
                  key={opt.value}
                  className={`flex-1 cursor-pointer rounded-DEFAULT border p-3 text-center text-sm ${
                    paymentMethod === opt.value ? "border-ink bg-ink text-white" : "border-line text-ink-soft"
                  }`}
                >
                  <input
                    type="radio"
                    name="payment"
                    className="sr-only"
                    checked={paymentMethod === opt.value}
                    onChange={() => setPaymentMethod(opt.value)}
                  />
                  {opt.label}
                </label>
              ))}
            </div>
            <textarea
              className="input min-h-20"
              placeholder="Sipariş notu (örn. Kapıcıya bırakılabilir)"
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />
          </section>

          {/* 4. Adım — Sözleşme Onayı */}
          <section>
            <h2 className="mb-3 text-sm font-medium">4. Sözleşme Onayı</h2>
            <div className="space-y-3">
              <label className="flex items-start gap-2 text-sm text-ink-soft">
                <input
                  type="checkbox"
                  className="mt-0.5 h-4 w-4 rounded border-line text-primary focus:ring-primary"
                  checked={distanceSalesAccepted}
                  onChange={(e) => setDistanceSalesAccepted(e.target.checked)}
                />
                <span>Mesafeli Satış Sözleşmesi&apos;ni okudum, onaylıyorum.</span>
              </label>
              <label className="flex items-start gap-2 text-sm text-ink-soft">
                <input
                  type="checkbox"
                  className="mt-0.5 h-4 w-4 rounded border-line text-primary focus:ring-primary"
                  checked={kvkkAccepted}
                  onChange={(e) => setKvkkAccepted(e.target.checked)}
                />
                <span>KVKK Aydınlatma Metni&apos;ni okudum, onaylıyorum.</span>
              </label>
            </div>
          </section>
        </div>

        {/* 5. Adım — Sipariş Onayı */}
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

          {error && <p className="mt-4 text-xs text-danger">{error}</p>}

          <button
            onClick={handleSubmit}
            disabled={!canSubmit || submitting}
            className="btn-primary mt-6 w-full"
          >
            {submitting ? "Sipariş oluşturuluyor…" : "Siparişi Onayla"}
          </button>
        </div>
      </div>
    </div>
  );
}
