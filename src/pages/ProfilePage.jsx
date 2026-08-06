import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import * as customerApi from "../api/customer";

// §4.12 Profil
export default function ProfilePage() {
  const { user } = useAuth();
  const [form, setForm] = useState({
    name: user?.name || "",
    email: user?.email || "",
    phone: user?.phone || "",
  });
  const [pw, setPw] = useState({ currentPassword: "", newPassword: "", newPasswordConfirm: "" });
  const [savedMsg, setSavedMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  async function handleProfileSubmit(e) {
    e.preventDefault();
    setErrorMsg("");
    try {
      await customerApi.updateProfile(form);
      setSavedMsg("Profil bilgileriniz güncellendi.");
    } catch {
      setErrorMsg("Bu özellik henüz backend'de hazır değil.");
    }
    setTimeout(() => setSavedMsg(""), 3000);
  }

  async function handlePasswordSubmit(e) {
    e.preventDefault();
    setErrorMsg("");
    try {
      await customerApi.changePassword(pw);
      setPw({ currentPassword: "", newPassword: "", newPasswordConfirm: "" });
      setSavedMsg("Şifreniz güncellendi.");
    } catch {
      setErrorMsg("Bu özellik henüz backend'de hazır değil.");
    }
    setTimeout(() => setSavedMsg(""), 3000);
  }

  return (
    <div className="max-w-lg space-y-10">
      <div>
        <h1 className="mb-6 text-xl font-semibold">Profil Bilgileri</h1>
        {savedMsg && <p className="mb-4 text-sm text-primary">{savedMsg}</p>}
        {errorMsg && <p className="mb-4 text-sm text-danger">{errorMsg}</p>}
        <form onSubmit={handleProfileSubmit} className="space-y-4">
          <div>
            <label className="label">Ad Soyad</label>
            <input
              className="input"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
          </div>
          <div>
            <label className="label">E-posta</label>
            <input
              type="email"
              className="input"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
          </div>
          <div>
            <label className="label">Telefon</label>
            <input
              type="tel"
              className="input"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
            />
          </div>
          <button type="submit" className="btn-primary">Bilgileri Kaydet</button>
        </form>
      </div>

      <div className="border-t border-line pt-8">
        <h2 className="mb-6 text-xl font-semibold">Şifre Değiştir</h2>
        <form onSubmit={handlePasswordSubmit} className="space-y-4">
          <div>
            <label className="label">Mevcut Şifre</label>
            <input
              type="password"
              className="input"
              value={pw.currentPassword}
              onChange={(e) => setPw({ ...pw, currentPassword: e.target.value })}
            />
          </div>
          <div>
            <label className="label">Yeni Şifre</label>
            <input
              type="password"
              className="input"
              value={pw.newPassword}
              onChange={(e) => setPw({ ...pw, newPassword: e.target.value })}
            />
          </div>
          <div>
            <label className="label">Yeni Şifre (Tekrar)</label>
            <input
              type="password"
              className="input"
              value={pw.newPasswordConfirm}
              onChange={(e) => setPw({ ...pw, newPasswordConfirm: e.target.value })}
            />
          </div>
          <button type="submit" className="btn-outline">Şifreyi Güncelle</button>
        </form>
      </div>
    </div>
  );
}
