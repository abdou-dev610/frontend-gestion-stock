import { createFileRoute, Outlet, redirect, Link, useRouter, useLocation } from "@tanstack/react-router";
import { useState } from "react";
import { authService } from "@/services/authService";
import {
  LayoutDashboard, Package, Boxes, Users, FileText, Settings, LogOut,
  Menu, X, Search, Bell, ChevronDown,
} from "lucide-react";

export const Route = createFileRoute("/_authenticated")({
  beforeLoad: () => {
    if (typeof window !== "undefined" && !localStorage.getItem("stockfact_auth")) {
      throw redirect({ to: "/login" });
    }
  },
  component: AdminLayout,
});

const nav = [
  { to: "/dashboard", label: "Tableau de bord", icon: LayoutDashboard },
  { to: "/products", label: "Produits", icon: Package },
  { to: "/stock", label: "Stock", icon: Boxes },
  { to: "/customers", label: "Clients", icon: Users },
  { to: "/invoices", label: "Factures", icon: FileText },
  { to: "/settings", label: "Paramètres", icon: Settings },
] as const;

function AdminLayout() {
  const router = useRouter();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const user = authService.getStoredUser();

  const logout = async () => {
    setDropdownOpen(false);
    await authService.logout();
    router.navigate({ to: "/login" });
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar desktop */}
      <aside className="hidden lg:flex flex-col w-64 bg-sidebar text-sidebar-foreground fixed inset-y-0 left-0 z-30">
        <SidebarContent location={location.pathname} onLogout={logout} />
      </aside>

      {/* Mobile drawer */}
      {mobileOpen && (
        <>
          <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setMobileOpen(false)} />
          <aside className="fixed inset-y-0 left-0 w-72 bg-sidebar text-sidebar-foreground z-50 lg:hidden flex flex-col">
            <SidebarContent location={location.pathname} onLogout={logout} onNavigate={() => setMobileOpen(false)} />
          </aside>
        </>
      )}

      {/* Main */}
      <div className="flex-1 lg:ml-64 flex flex-col min-w-0">
        {/* Header */}
        <header className="sticky top-0 z-20 bg-card border-b border-border h-16 flex items-center px-4 sm:px-6 gap-3">
          <button onClick={() => setMobileOpen(true)} className="lg:hidden p-2 -ml-2 rounded-lg hover:bg-muted">
            <Menu className="w-5 h-5" />
          </button>
          <div className="flex-1 max-w-xl relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text" placeholder="Rechercher (produits, clients, factures...)"
              className="w-full pl-9 pr-3 py-2 rounded-lg bg-muted text-sm border border-transparent focus:outline-none focus:bg-background focus:border-input"
            />
          </div>
          <button className="p-2 rounded-lg hover:bg-muted">
            <Bell className="w-5 h-5 text-muted-foreground" />
          </button>
          <div className="relative hidden sm:block">
            <button onClick={() => setDropdownOpen(d => !d)} className="flex items-center gap-2 pl-3 border-l border-border hover:opacity-80 transition">
              <div className="w-9 h-9 rounded-full bg-accent text-accent-foreground flex items-center justify-center text-sm font-semibold">
                {user?.name?.[0]?.toUpperCase() || "U"}
              </div>
              <div className="hidden md:block leading-tight">
                <div className="text-sm font-medium">{user?.name || "Utilisateur"}</div>
                <div className="text-xs text-muted-foreground">{user?.email || ""}</div>
              </div>
              <ChevronDown className="w-4 h-4 text-muted-foreground hidden md:block" />
            </button>
            {dropdownOpen && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setDropdownOpen(false)} />
                <div className="absolute right-0 top-full mt-2 w-56 bg-card border border-border rounded-xl shadow-lg z-20 py-1">
                  <div className="px-4 py-3 border-b border-border">
                    <div className="text-sm font-semibold">{user?.name || "Utilisateur"}</div>
                    <div className="text-xs text-muted-foreground truncate">{user?.email || ""}</div>
                    {user?.role && (
                      <div className="mt-1 text-xs font-medium text-accent">
                        {user.role === "admin" ? "Administrateur" : "Vendeur"}
                      </div>
                    )}
                  </div>
                  <button onClick={logout} className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-destructive hover:bg-destructive-soft transition">
                    <LogOut className="w-4 h-4" /> Se déconnecter
                  </button>
                </div>
              </>
            )}
          </div>
        </header>

        <main className="flex-1 p-4 sm:p-6 lg:p-8 min-w-0">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

function SidebarContent({ location, onLogout, onNavigate }: { location: string; onLogout: () => void; onNavigate?: () => void }) {
  return (
    <>
      <div className="h-16 flex items-center justify-between px-5 border-b border-sidebar-border">
        <Link to="/dashboard" className="flex items-center gap-2" onClick={onNavigate}>
          <div className="w-9 h-9 rounded-lg bg-accent text-accent-foreground flex items-center justify-center">
            <Package className="w-5 h-5" />
          </div>
          <div className="font-bold">StockFact <span className="text-accent">Pro</span></div>
        </Link>
        {onNavigate && (
          <button onClick={onNavigate} className="p-1 lg:hidden"><X className="w-5 h-5" /></button>
        )}
      </div>
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {nav.map((item) => {
          const Icon = item.icon;
          const active = location.startsWith(item.to);
          return (
            <Link
              key={item.to} to={item.to} onClick={onNavigate}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition ${
                active ? "bg-sidebar-accent text-sidebar-accent-foreground" : "text-sidebar-foreground/80 hover:bg-white/5 hover:text-sidebar-foreground"
              }`}
            >
              <Icon className="w-4 h-4" /> {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="p-3 border-t border-sidebar-border">
        <button onClick={onLogout} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-sidebar-foreground/80 hover:bg-white/5 hover:text-sidebar-foreground">
          <LogOut className="w-4 h-4" /> Déconnexion
        </button>
      </div>
    </>
  );
}
