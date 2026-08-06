import { useState } from "react";
import { Link } from "react-router-dom";
import * as authApi from "../api/auth";

// §4.11 Şifremi Unuttum
export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitting(true);
    try {
      await authApi.forgotPassword({ email });
    } finally {
      // §4.11: var olmayan e-posta için dahi aynı genel mesaj gösterilir
      // (kullanıcı numaralandırma saldırısını önlemek için) — bu yüzden
      // başarı/hata ayrımı yapılmaz, her durumda aynı ekrana geçilir.
      setSubmitting(false);
      setSent(true);
    }
  }

  if (sent) {
    return (
      <div className="container-page flex justify-center py-24 text-center">
        <div className="max-w-sm">
          <h1 className="text-xl font-semibold">E-postanızı kontrol edin</h1>
          <p className="mt-3 text-sm text-ink-soft">
            {email} adresine kayıtlıysa, şifre sıfırlama bağlantısı gönderildi.
          </p>
          <Link to="/giris" className="mt-6 inline-block text-primary">Giriş sayfasına dön</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container-page flex justify-center py-16">
      <div className="w-full max-w-sm">
        <h1 className="mb-1 text-2xl font-semibold">Şifremi Unuttum</h1>
        <p className="mb-8 text-sm text-ink-soft">
          Hesabınıza kayıtlı e-posta adresini girin, sıfırlama bağlantısı gönderelim.
        </p>
        <form onSubmit={handleSubmit}>
          <div className="mb-6">
            <label className="label" htmlFor="email">E-posta</label>
            <input
              id="email"
              type="email"
              required
              className="input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <button type="submit" disabled={submitting} className="btn-primary w-full">
            {submitting ? "Gönderiliyor…" : "Sıfırlama Bağlantısı Gönder"}
          </button>
        </form>
      </div>
    </div>
  );
}
