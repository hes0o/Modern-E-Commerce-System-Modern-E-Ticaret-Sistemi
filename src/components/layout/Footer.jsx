import { Link } from "react-router-dom";

// §4.1 — Alt bilgi (footer): kurumsal linkler, iletişim, sosyal medya,
// KVKK/Mesafeli Satış/İade Politikası linkleri.
const columns = [
  {
    title: "Kurumsal",
    links: [
      { label: "Hakkımızda", to: "/hakkimizda" },
      { label: "İletişim", to: "/iletisim" },
      { label: "SSS", to: "/sss" },
    ],
  },
  {
    title: "Yasal",
    links: [
      { label: "KVKK", to: "/kvkk" },
      { label: "Mesafeli Satış Sözleşmesi", to: "/mesafeli-satis-sozlesmesi" },
      { label: "İade Politikası", to: "/iade-politikasi" },
      { label: "Gizlilik Politikası", to: "/gizlilik-politikasi" },
    ],
  },
];

export default function Footer() {
  return (
    <footer className="mt-24 border-t border-line bg-surface">
      <div className="container-page grid grid-cols-2 gap-8 py-14 sm:grid-cols-4">
        <div className="col-span-2 sm:col-span-1">
          <span className="font-display text-lg font-semibold text-ink">
            norda<span className="text-primary">.</span>
          </span>
          <p className="mt-3 max-w-[220px] text-sm text-ink-soft">
            Sade, güvenilir ve hızlı bir alışveriş deneyimi.
          </p>
        </div>

        {columns.map((col) => (
          <div key={col.title}>
            <h5 className="mb-3 text-xs font-medium uppercase tracking-wide text-ink-faint">
              {col.title}
            </h5>
            <ul className="space-y-2">
              {col.links.map((l) => (
                <li key={l.to}>
                  <Link to={l.to} className="text-sm text-ink-soft hover:text-ink">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}

        <div>
          <h5 className="mb-3 text-xs font-medium uppercase tracking-wide text-ink-faint">
            İletişim
          </h5>
          <p className="text-sm text-ink-soft">destek@norda.com</p>
          <p className="mt-1 text-sm text-ink-soft">0850 000 00 00</p>
        </div>
      </div>

      <div className="border-t border-line py-4">
        <p className="container-page text-xs text-ink-faint">
          © {new Date().getFullYear()} Norda. Tüm hakları saklıdır.
        </p>
      </div>
    </footer>
  );
}
