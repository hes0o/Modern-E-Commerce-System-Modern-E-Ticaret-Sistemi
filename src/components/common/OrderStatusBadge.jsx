import Badge from "./Badge";

// §7.3 Sipariş Durumları — backend enum değerleriyle (OrderStatus) birebir
// eşleşmeli: pending, confirmed, preparing, shipped, completed, cancelled.
const STATUS_MAP = {
  pending: { label: "Beklemede", variant: "neutral" },
  confirmed: { label: "Onaylandı", variant: "primary" },
  preparing: { label: "Hazırlanıyor", variant: "primary" },
  shipped: { label: "Kargoda", variant: "primary" },
  completed: { label: "Tamamlandı", variant: "primary" },
  cancelled: { label: "İptal Edildi", variant: "danger" },
};

export default function OrderStatusBadge({ status }) {
  const info = STATUS_MAP[status] || { label: status, variant: "neutral" };
  return <Badge variant={info.variant}>{info.label}</Badge>;
}
