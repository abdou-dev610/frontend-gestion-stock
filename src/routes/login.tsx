import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { Package, Eye, EyeOff, Mail, Lock } from "lucide-react";
import { authService } from "@/services/authService";

export const Route = createFileRoute("/login")({
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await authService.login(email, password);
      navigate({ to: "/dashboard" });
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message || "Identifiants incorrects";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-10 bg-gradient-to-br from-primary-soft via-background to-primary-soft">
      <div className="w-full max-w-md">
        <div className="bg-card rounded-2xl shadow-xl border border-border/60 p-8 sm:p-10">
          <div className="flex flex-col items-center mb-8">
            <div className="w-14 h-14 rounded-2xl bg-primary text-primary-foreground flex items-center justify-center shadow-lg mb-4">
              <Package className="w-7 h-7" />
            </div>
            <h1 className="text-2xl font-bold text-foreground">StockFact <span className="text-accent">Pro</span></h1>
            <p className="text-sm text-muted-foreground mt-1 text-center">Gérez vos factures, stocks et clients facilement</p>
          </div>

          {error && (
            <div className="mb-4 px-4 py-3 rounded-lg bg-destructive-soft border border-destructive/20 text-destructive text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="text-sm font-medium text-foreground mb-1.5 block">Email</label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
                  placeholder="votre@email.com"
                  className="w-full pl-10 pr-3 py-2.5 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-foreground mb-1.5 block">Mot de passe</label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input
                  type={showPwd ? "text" : "password"} required value={password} onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-10 py-2.5 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
                />
                <button type="button" onClick={() => setShowPwd(!showPwd)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                  {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button type="submit" disabled={loading}
              className="w-full bg-accent text-accent-foreground py-2.5 rounded-lg font-medium hover:opacity-90 transition disabled:opacity-60">
              {loading ? "Connexion en cours..." : "Se connecter"}
            </button>
          </form>

        </div>
        <p className="text-center text-xs text-muted-foreground mt-6">© 2026 StockFact Pro — ERP de facturation et gestion de stock</p>
      </div>
    </div>
  );
}
