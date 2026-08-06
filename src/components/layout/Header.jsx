import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Search, ShoppingBag, User, Menu, X } from "lucide-react";
import { mockCategories } from "../../data/mock";
import { useCart } from "../../context/CartContext";
import { useAuth } from "../../context/AuthContext";

// §4.1 Ana Sayfa / Bileşenler — Üst menü (header): logo, kategori menüsü,
// arama kutusu, sepet ikonu, kullanıcı giriş/profil ikonu.
export default function Header() {
  const [query, setQuery] = useState("");
  const [mobileOpen, setMobileOpen] = useState(false);
  const { itemCount } = useCart();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  function handleSearchSubmit(e) {
    e.preventDefault();
    if (!query.trim()) return;
    navigate(`/arama?q=${encodeURIComponent(query.trim())}`);
  }

  return (
    <header className="sticky top-0 z-30 border-b border-line bg-paper/95 backdrop-blur">
      <div className="container-page flex h-16 items-center gap-6">
        <button
          className="lg:hidden"
          onClick={() => setMobileOpen((v) => !v)}
          aria-label="Menüyü aç"
        >
          {mobileOpen ? <X size={20} /> : <Menu size={20} />}
        </button>

        <Link to="/" className="font-display text-lg font-semibold tracking-tight text-ink">
          norda<span className="text-primary">.</span>
        </Link>

        <nav className="hidden gap-5 lg:flex">
          {mockCategories.map((c) => (
            <Link
              key={c.id}
              to={`/kategori/${c.id}-${c.slug}`}
              className="text-sm text-ink-soft transition-colors hover:text-ink"
            >
              {c.name}
            </Link>
          ))}
        </nav>

        <form onSubmit={handleSearchSubmit} className="ml-auto hidden max-w-sm flex-1 md:flex">
          <div className="relative w-full">
            <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-faint" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              type="search"
              placeholder="Ürün, kategori veya marka ara"
              className="input pl-9 py-2 text-sm"
            />
          </div>
        </form>

        <div className="ml-auto flex items-center gap-4 md:ml-0">
          <Link
            to={isAuthenticated ? "/profil" : "/giris"}
            className="text-ink-soft transition-colors hover:text-ink"
            aria-label="Hesabım"
          >
            <User size={20} />
          </Link>
          <Link
            to="/sepet"
            className="relative text-ink-soft transition-colors hover:text-ink"
            aria-label="Sepetim"
          >
            <ShoppingBag size={20} />
            {itemCount > 0 && (
              <span className="absolute -right-2 -top-2 flex h-4 w-4 items-center justify-center rounded-full bg-accent text-[10px] font-medium text-white">
                {itemCount}
              </span>
            )}
          </Link>
        </div>
      </div>

      {mobileOpen && (
        <div className="border-t border-line px-4 pb-4 pt-2 lg:hidden">
          <form onSubmit={handleSearchSubmit} className="mb-3">
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              type="search"
              placeholder="Ürün, kategori veya marka ara"
              className="input py-2 text-sm"
            />
          </form>
          <nav className="flex flex-col gap-3">
            {mockCategories.map((c) => (
              <Link
                key={c.id}
                to={`/kategori/${c.id}-${c.slug}`}
                onClick={() => setMobileOpen(false)}
                className="text-sm text-ink-soft"
              >
                {c.name}
              </Link>
            ))}
          </nav>
        </div>
      )}
    </header>
  );
}
