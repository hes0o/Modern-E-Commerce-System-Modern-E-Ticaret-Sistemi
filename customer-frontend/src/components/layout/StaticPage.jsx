// §4.15-4.21 statik/kurumsal sayfalar — gerçek projede içerik admin panelinden
// (CMS benzeri bir "sayfa içeriği" modülünden) yönetilecek; burada frontend'in
// bu içeriği render etme şeklini göstermek için sabit metin kullanıldı.
export default function StaticPage({ title, updatedAt, children }) {
  return (
    <div className="container-page max-w-2xl py-14">
      <h1 className="text-2xl font-semibold">{title}</h1>
      {updatedAt && <p className="mt-1 text-xs text-ink-faint">Son güncelleme: {updatedAt}</p>}
      <div className="prose-legal mt-8 space-y-4 text-sm leading-relaxed text-ink-soft">
        {children}
      </div>
    </div>
  );
}
