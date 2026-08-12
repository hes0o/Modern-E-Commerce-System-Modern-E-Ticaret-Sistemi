import { Link } from "react-router-dom";
import { formatPrice } from "../lib/format";
import OrderStatusBadge from "../components/common/OrderStatusBadge";

// §4.14 Siparişlerim
// TODO(backend): getMyOrders() (src/api/orders.js) hazır olunca bu mock
// listenin yerini alacak.
const mockOrders = [
  { id: "1001", order_number: "ORD-2026-1001", created_at: "2026-07-28", grand_total: 2799, status: "shipped" },
  { id: "1002", order_number: "ORD-2026-1002", created_at: "2026-08-01", grand_total: 899, status: "pending" },
];

export default function OrdersPage() {
  return (
    <div>
      <h1 className="mb-6 text-xl font-semibold">Siparişlerim</h1>

      {mockOrders.length === 0 ? (
        <p className="text-sm text-ink-soft">Henüz bir siparişiniz bulunmuyor.</p>
      ) : (
        <div className="divide-y divide-line rounded-lg border border-line">
          {mockOrders.map((o) => (
            <Link
              key={o.id}
              to={`/siparislerim/${o.id}`}
              className="flex items-center justify-between px-5 py-4 hover:bg-black/[0.02]"
            >
              <div>
                <p className="font-mono text-sm">{o.order_number}</p>
                <p className="mt-0.5 text-xs text-ink-faint">{o.created_at}</p>
              </div>
              <div className="flex items-center gap-4">
                <OrderStatusBadge status={o.status} />
                <span className="font-mono text-sm">{formatPrice(o.grand_total)}</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
