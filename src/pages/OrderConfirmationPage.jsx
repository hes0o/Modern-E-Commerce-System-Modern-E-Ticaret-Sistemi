import { Link, useLocation, useParams } from "react-router-dom";
import { CheckCircle2 } from "lucide-react";

// §7.1 Adım 5: "sistem sipariş numarası üretir ve onay ekranı/e-postası gönderir."
export default function OrderConfirmationPage() {
  const { orderNumber } = useParams();
  const location = useLocation();
  const order = location.state?.order;

  return (
    <div className="container-page flex flex-col items-center py-24 text-center">
      <CheckCircle2 size={48} className="text-primary" />
      <h1 className="mt-5 text-2xl font-semibold">Siparişiniz Alındı</h1>
      <p className="mt-2 max-w-sm text-sm text-ink-soft">
        Sipariş numaranız <span className="font-mono text-ink">{orderNumber}</span>. Sipariş
        detaylarını e-posta adresinize gönderdik.
      </p>
      {order?.payment_method === "bank_transfer" && (
        <p className="mt-3 max-w-sm text-xs text-ink-faint">
          Havale/EFT bildiriminizi yaptıktan sonra siparişiniz onaylanacaktır.
        </p>
      )}
      <div className="mt-8 flex gap-3">
        <Link to="/siparislerim" className="btn-primary">Siparişlerimi Gör</Link>
        <Link to="/" className="btn-outline">Alışverişe Devam Et</Link>
      </div>
    </div>
  );
}
