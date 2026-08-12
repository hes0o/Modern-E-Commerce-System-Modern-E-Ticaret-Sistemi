import { useState } from "react";
import { Plus, Star, Trash2, Pencil } from "lucide-react";

// §4.13 Adreslerim
// TODO(backend): getAddresses/createAddress/updateAddress/deleteAddress
// (src/api/customer.js) API hazır olunca burada devreye alınacak; şimdilik
// yerel state ile form akışı kuruldu.
export default function AddressesPage() {
  const [addresses, setAddresses] = useState([
    {
      id: 1,
      title: "Ev",
      recipient: "Ayşe Yılmaz",
      line: "Bağdat Cd. No: 120 D: 4",
      city: "İstanbul",
      district: "Kadıköy",
      phone: "0532 000 00 00",
      isDefault: true,
    },
  ]);
  const [formOpen, setFormOpen] = useState(false);

  function setDefault(id) {
    setAddresses((prev) => prev.map((a) => ({ ...a, isDefault: a.id === id })));
  }

  function remove(id) {
    setAddresses((prev) => prev.filter((a) => a.id !== id));
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-xl font-semibold">Adreslerim</h1>
        <button onClick={() => setFormOpen(true)} className="btn-outline">
          <Plus size={14} /> Yeni Adres
        </button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {addresses.map((a) => (
          <div key={a.id} className="card p-4">
            <div className="mb-2 flex items-center justify-between">
              <p className="text-sm font-medium">{a.title}</p>
              {a.isDefault && (
                <span className="flex items-center gap-1 text-xs text-primary">
                  <Star size={12} fill="currentColor" /> Varsayılan
                </span>
              )}
            </div>
            <p className="text-sm text-ink-soft">{a.recipient}</p>
            <p className="text-sm text-ink-soft">{a.line}</p>
            <p className="text-sm text-ink-soft">{a.district} / {a.city}</p>
            <p className="text-sm text-ink-soft">{a.phone}</p>
            <div className="mt-3 flex gap-3 text-xs">
              <button className="flex items-center gap-1 text-ink-soft hover:text-ink">
                <Pencil size={12} /> Düzenle
              </button>
              {!a.isDefault && (
                <button onClick={() => setDefault(a.id)} className="text-ink-soft hover:text-ink">
                  Varsayılan Yap
                </button>
              )}
              <button onClick={() => remove(a.id)} className="flex items-center gap-1 text-ink-soft hover:text-danger">
                <Trash2 size={12} /> Sil
              </button>
            </div>
          </div>
        ))}
      </div>

      {formOpen && (
        <div className="mt-6 card p-5">
          <p className="mb-4 text-sm font-medium">Yeni Adres Ekle</p>
          <div className="grid gap-3 sm:grid-cols-2">
            <input className="input" placeholder="Adres Başlığı (Ev, İş vb.)" />
            <input className="input" placeholder="Alıcı Adı Soyadı" />
            <input className="input sm:col-span-2" placeholder="Açık Adres" />
            <input className="input" placeholder="İl" />
            <input className="input" placeholder="İlçe" />
            <input className="input" placeholder="Posta Kodu" />
            <input className="input" placeholder="Telefon" />
          </div>
          <div className="mt-4 flex gap-3">
            <button className="btn-primary" onClick={() => setFormOpen(false)}>Kaydet</button>
            <button className="btn-ghost" onClick={() => setFormOpen(false)}>Vazgeç</button>
          </div>
        </div>
      )}
    </div>
  );
}
