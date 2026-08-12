import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { ApiError } from "../api/client";

// §4.10 Kayıt
//
// Alan sözleşmesi backend ile konuşulan haliyle:
//  name, email, phone, password, password_confirm,
//  kvkk_accepted (zorunlu), terms_accepted (zorunlu — "Üyelik sözleşmesi"),
//  newsletter_allowed (opsiyonel)
export default function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    passwordConfirm: "",
    kvkkAccepted: false,
    termsAccepted: false,
    newsletterAllowed: false,
  });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState("");

  function set(key, value) {
    setForm((f) => ({ ...f, [key]: value }));
    if (errors[key]) setErrors((e) => ({ ...e, [key]: undefined }));
  }

  function validate() {
    const next = {};
    if (!form.name.trim()) next.name = "Ad soyad zorunludur.";
    if (!/^\S+@\S+\.\S+$/.test(form.email)) next.email = "Geçerli bir e-posta adresi girin.";
    if (form.password.length < 8) next.password = "Şifre en az 8 karakter olmalıdır.";
    if (form.password !== form.passwordConfirm) next.passwordConfirm = "Şifreler eşleşmiyor.";
    if (!form.kvkkAccepted) next.kvkkAccepted = "KVKK metnini onaylamanız gerekiyor.";
    if (!form.termsAccepted) next.termsAccepted = "Üyelik sözleşmesini onaylamanız gerekiyor.";
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setServerError("");
    if (!validate()) return;

    setSubmitting(true);
    try {
      await register(form);
      navigate("/");
    } catch (err) {
      if (err instanceof ApiError && err.status === 422 && err.errors) {
        setErrors(err.errors);
      } else if (err instanceof ApiError && err.status === 409) {
        setServerError("Bu e-posta adresi zaten kayıtlı.");
      } else {
        setServerError("Kayıt sırasında bir hata oluştu. Lütfen tekrar deneyin.");
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="container-page flex justify-center py-16">
      <div className="w-full max-w-md">
        <h1 className="mb-1 text-2xl font-semibold">Üye Ol</h1>
        <p className="mb-8 text-sm text-ink-soft">
          Zaten hesabınız var mı? <Link to="/giris" className="text-primary">Giriş yapın</Link>
        </p>

        {serverError && (
          <div className="mb-5 rounded-DEFAULT bg-danger/10 px-3.5 py-2.5 text-sm text-danger">
            {serverError}
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate>
          <div className="mb-4">
            <label className="label" htmlFor="name">Ad Soyad</label>
            <input
              id="name"
              className="input"
              value={form.name}
              onChange={(e) => set("name", e.target.value)}
            />
            {errors.name && <p className="field-error">{errors.name}</p>}
          </div>

          <div className="mb-4">
            <label className="label" htmlFor="email">E-posta</label>
            <input
              id="email"
              type="email"
              className="input"
              value={form.email}
              onChange={(e) => set("email", e.target.value)}
            />
            {errors.email && <p className="field-error">{errors.email}</p>}
          </div>

          <div className="mb-4">
            <label className="label" htmlFor="phone">Telefon</label>
            <input
              id="phone"
              type="tel"
              className="input"
              value={form.phone}
              onChange={(e) => set("phone", e.target.value)}
            />
            {errors.phone && <p className="field-error">{errors.phone}</p>}
          </div>

          <div className="mb-4">
            <label className="label" htmlFor="password">Şifre</label>
            <input
              id="password"
              type="password"
              className="input"
              value={form.password}
              onChange={(e) => set("password", e.target.value)}
            />
            {errors.password && <p className="field-error">{errors.password}</p>}
          </div>

          <div className="mb-5">
            <label className="label" htmlFor="passwordConfirm">Şifre Tekrar</label>
            <input
              id="passwordConfirm"
              type="password"
              className="input"
              value={form.passwordConfirm}
              onChange={(e) => set("passwordConfirm", e.target.value)}
            />
            {errors.passwordConfirm && <p className="field-error">{errors.passwordConfirm}</p>}
          </div>

          <div className="space-y-3">
            <label className="flex items-start gap-2 text-sm text-ink-soft">
              <input
                type="checkbox"
                className="mt-0.5 h-4 w-4 rounded border-line text-primary focus:ring-primary"
                checked={form.kvkkAccepted}
                onChange={(e) => set("kvkkAccepted", e.target.checked)}
              />
              <span>
                <Link to="/kvkk" className="text-ink underline underline-offset-2">
                  KVKK Aydınlatma Metni
                </Link>
                &apos;ni okudum, onaylıyorum.
              </span>
            </label>
            {errors.kvkkAccepted && <p className="field-error">{errors.kvkkAccepted}</p>}

            <label className="flex items-start gap-2 text-sm text-ink-soft">
              <input
                type="checkbox"
                className="mt-0.5 h-4 w-4 rounded border-line text-primary focus:ring-primary"
                checked={form.termsAccepted}
                onChange={(e) => set("termsAccepted", e.target.checked)}
              />
              <span>Üyelik Sözleşmesi&apos;ni okudum, onaylıyorum.</span>
            </label>
            {errors.termsAccepted && <p className="field-error">{errors.termsAccepted}</p>}

            <label className="flex items-start gap-2 text-sm text-ink-soft">
              <input
                type="checkbox"
                className="mt-0.5 h-4 w-4 rounded border-line text-primary focus:ring-primary"
                checked={form.newsletterAllowed}
                onChange={(e) => set("newsletterAllowed", e.target.checked)}
              />
              <span>Kampanya ve fırsatlardan e-posta ile haberdar olmak istiyorum.</span>
            </label>
          </div>

          <button type="submit" disabled={submitting} className="btn-primary mt-7 w-full">
            {submitting ? "Hesap oluşturuluyor…" : "Hesap Oluştur"}
          </button>
        </form>
      </div>
    </div>
  );
}
