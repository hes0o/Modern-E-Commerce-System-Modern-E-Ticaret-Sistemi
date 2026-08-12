import { NavLink, Outlet } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const links = [
  { to: "/profil", label: "Profil" },
  { to: "/adreslerim", label: "Adreslerim" },
  { to: "/siparislerim", label: "Siparişlerim" },
  { to: "/favorilerim", label: "Favorilerim" },
];

export default function AccountLayout() {
  const { user, logout } = useAuth();

  return (
    <div className="container-page py-10">
      <div className="grid gap-10 lg:grid-cols-[220px_1fr]">
        <aside>
          <p className="mb-4 text-sm font-medium">{user?.name || "Hesabım"}</p>
          <nav className="flex flex-col gap-1">
            {links.map((l) => (
              <NavLink
                key={l.to}
                to={l.to}
                className={({ isActive }) =>
                  `rounded-DEFAULT px-3 py-2 text-sm ${
                    isActive ? "bg-primary-soft text-primary" : "text-ink-soft hover:bg-black/[0.03]"
                  }`
                }
              >
                {l.label}
              </NavLink>
            ))}
            <button
              onClick={logout}
              className="mt-2 rounded-DEFAULT px-3 py-2 text-left text-sm text-danger hover:bg-danger/5"
            >
              Çıkış Yap
            </button>
          </nav>
        </aside>
        <div>
          <Outlet />
        </div>
      </div>
    </div>
  );
}
