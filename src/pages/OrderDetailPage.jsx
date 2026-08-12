import { useParams } from "react-router-dom";
import { formatPrice } from "../lib/format";
import OrderStatusBadge from "../components/common/OrderStatusBadge";

// §4.14 — Sipariş detay görünümü: ürünler, adres, kargo/takip bilgisi, durum geçmişi.
// TODO(backend): getOrderById(id) hazır olunca mock veri kaldırılacak.
const mockOrder = {
  order_number: "ORD-2026-1001",
  status: "shipped",
  created_at: "2026-07-28",
  tracking_number: "YK123456789TR",
  address: { title: "Ev", line: "Bağdat Cd. No: 120 D: 4", district: "Kadıköy", city: "İstanbul" },
  items: [
    { name: "Oversize Yün Palto", variant: "Bej / M", quantity: 1, unit_price: 2799 },
  ],
  status_history: [
    { status: "pending", at: "28 Tem 2026, 14:20" },
    { status: "confirmed", at: "28 Tem 2026, 16:05" },
    { status: "preparing", at: "29 Tem 2026, 09:10" },
    { status: "shipped", at: "30 Tem 2026, 11:40" },
  ],
};

export default function OrderDetailPage() {
  const { id } = useParams();
  const order = mockOrder; // id ile fetch edilecek
  const total = order.items.reduce((sum, i) => sum + i.unit_price * i.quantity, 0);

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="font-mono text-lg font-semibold">{order.order_number}</h1>
          <p className="text-xs text-ink-faint">{order.created_at}</p>
        </div>
        <OrderStatusBadge status={order.status} />
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <h2 className="mb-3 text-sm font-medium">Ürünler</h2>
          <div className="divide-y divide-line rounded-lg border border-line">
            {order.items.map((item, i) => (
              <div key={i} className="flex items-center justify-between px-4 py-3">
                <div>
                  <p className="text-sm">{item.name}</p>
                  <p className="text-xs text-ink-faint">{item.variant} · Adet: {item.quantity}</p>
                </div>
                <span className="font-mono text-sm">{formatPrice(item.unit_price * item.quantity)}</span>
              </div>
            ))}
          </div>

          <h2 className="mb-3 mt-8 text-sm font-medium">Durum Geçmişi</h2>
          <ol className="space-y-3 border-l border-line pl-4">
            {order.status_history.map((h, i) => (
              <li key={i} className="relative text-sm">
                <span className="absolute -left-[21px] top-1 h-2 w-2 rounded-full bg-primary" />
                <OrderStatusBadge status={h.status} />
                <span className="ml-2 text-ink-faint">{h.at}</span>
              </li>
            ))}
          </ol>
        </div>

        <div className="space-y-6">
          <div className="card p-4">
            <h3 className="mb-2 text-sm font-medium">Teslimat Adresi</h3>
            <p className="text-sm text-ink-soft">{order.address.title}</p>
            <p className="text-sm text-ink-soft">{order.address.line}</p>
            <p className="text-sm text-ink-soft">{order.address.district} / {order.address.city}</p>
          </div>

          {order.tracking_number && (
            <div className="card p-4">
              <h3 className="mb-2 text-sm font-medium">Kargo Takip</h3>
              <p className="font-mono text-sm">{order.tracking_number}</p>
            </div>
          )}

          <div className="card p-4">
            <div className="flex justify-between text-sm font-medium">
              <span>Genel Toplam</span>
              <span className="font-mono">{formatPrice(total)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
