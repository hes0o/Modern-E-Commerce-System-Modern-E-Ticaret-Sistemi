import { useState } from "react";

// §4.15 İletişim — iletişim formu (ad, e-posta, konu, mesaj) + kurumsal bilgiler
export default function ContactPage() {
  const [sent, setSent] = useState(false);

  function handleSubmit(e) {
    e.preventDefault();
    setSent(true);
  }

  return (
    <div className="container-page grid gap-12 py-14 lg:grid-cols-2">
      <div>
        <h1 className="mb-4 text-2xl font-semibold">İletişim</h1>
        <p className="mb-8 text-sm text-ink-soft">
          Sorularınız için formu doldurabilir veya doğrudan bize ulaşabilirsiniz.
        </p>
        <div className="space-y-2 text-sm text-ink-soft">
          <p>destek@norda.com</p>
          <p>0850 000 00 00</p>
          <p>Levent Mah. Örnek Cd. No: 1, Beşiktaş / İstanbul</p>
        </div>
      </div>

      <div>
        {sent ? (
          <div className="card p-6 text-sm text-primary">
            Mesajınız iletildi, en kısa sürede dönüş yapacağız.
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label">Ad Soyad</label>
              <input required className="input" />
            </div>
            <div>
              <label className="label">E-posta</label>
              <input required type="email" className="input" />
            </div>
            <div>
              <label className="label">Konu</label>
              <input required className="input" />
            </div>
            <div>
              <label className="label">Mesaj</label>
              <textarea required className="input min-h-32" />
            </div>
            <button type="submit" className="btn-primary">Gönder</button>
          </form>
        )}
      </div>
    </div>
  );
}
