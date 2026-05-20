import { createFileRoute } from "@tanstack/react-router";
import { Link } from "@tanstack/react-router";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { Package, Users, FileText, TrendingUp, AlertTriangle, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { Card, Badge, PageHeader } from "@/components/common";
import { mockDashboardStats, mockSalesData, mockProducts, mockInvoices } from "@/lib/mockData";
import { formatCurrency, formatDate } from "@/lib/format";

export const Route = createFileRoute("/_authenticated/dashboard")({
  component: DashboardPage,
});

const stats = [
  { label: "Total produits", value: mockDashboardStats.totalProducts.toLocaleString("fr-FR"), change: "+12.5%", up: true, icon: Package, tint: "bg-primary-soft text-primary" },
  { label: "Total clients", value: mockDashboardStats.totalCustomers.toLocaleString("fr-FR"), change: "+8.3%", up: true, icon: Users, tint: "bg-success-soft text-success" },
  { label: "Total factures", value: mockDashboardStats.totalInvoices.toLocaleString("fr-FR"), change: "+15.7%", up: true, icon: FileText, tint: "bg-warning-soft text-warning" },
  { label: "Chiffre d'affaires", value: formatCurrency(mockDashboardStats.revenue), change: "+18.4%", up: true, icon: TrendingUp, tint: "bg-accent/15 text-accent" },
  { label: "Stock faible", value: String(mockDashboardStats.lowStock), change: "Critique", up: false, icon: AlertTriangle, tint: "bg-destructive-soft text-destructive" },
];

const statusTone = (s: string) => s === "Payée" ? "success" : s === "Partiellement payée" ? "warning" : "destructive";

function DashboardPage() {
  const lowStock = mockProducts.filter(p => p.quantity <= p.threshold).slice(0, 4);
  return (
    <div className="space-y-6">
      <PageHeader title="Tableau de bord" subtitle="Vue d'ensemble de votre activité" />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        {stats.map((s) => {
          const Icon = s.icon;
          return (
            <Card key={s.label} className="p-5">
              <div className="flex items-start justify-between mb-3">
                <span className="text-sm text-muted-foreground">{s.label}</span>
                <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${s.tint}`}><Icon className="w-4 h-4" /></div>
              </div>
              <div className="text-2xl font-bold text-foreground">{s.value}</div>
              <div className={`flex items-center gap-1 text-xs font-medium mt-2 ${s.up ? "text-success" : "text-destructive"}`}>
                {s.up ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                {s.change}
              </div>
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2 p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-semibold">Évolution des ventes</h3>
              <p className="text-xs text-muted-foreground">6 derniers mois</p>
            </div>
            <Badge tone="info">FCFA</Badge>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={mockSalesData} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="grad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="oklch(0.62 0.18 255)" stopOpacity={0.4} />
                    <stop offset="100%" stopColor="oklch(0.62 0.18 255)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.92 0.01 250)" vertical={false} />
                <XAxis dataKey="month" tick={{ fontSize: 12, fill: "oklch(0.52 0.03 250)" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 12, fill: "oklch(0.52 0.03 250)" }} axisLine={false} tickLine={false} tickFormatter={(v) => `${v / 1000000}M`} />
                <Tooltip formatter={(v) => formatCurrency(Number(v))} contentStyle={{ borderRadius: 10, border: "1px solid oklch(0.92 0.01 250)" }} />
                <Area type="monotone" dataKey="value" stroke="oklch(0.62 0.18 255)" strokeWidth={2.5} fill="url(#grad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold">Alertes stock faible</h3>
            <Link to="/stock" className="text-xs text-accent hover:underline">Voir tout</Link>
          </div>
          <div className="space-y-3">
            {lowStock.map((p) => (
              <div key={p.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50">
                <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center"><Package className="w-4 h-4 text-muted-foreground" /></div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium truncate">{p.name}</div>
                  <div className="text-xs text-muted-foreground">{p.category}</div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-semibold text-destructive">{p.quantity} unités</div>
                  <div className="text-xs text-muted-foreground">Seuil {p.threshold}</div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <Card className="overflow-hidden">
        <div className="flex items-center justify-between p-5 border-b border-border">
          <h3 className="font-semibold">Factures récentes</h3>
          <Link to="/invoices" className="text-xs text-accent hover:underline">Voir toutes</Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 text-muted-foreground text-xs uppercase">
              <tr>
                <th className="text-left font-medium px-5 py-3">N° Facture</th>
                <th className="text-left font-medium px-5 py-3">Client</th>
                <th className="text-left font-medium px-5 py-3 hidden sm:table-cell">Date</th>
                <th className="text-right font-medium px-5 py-3">Montant</th>
                <th className="text-left font-medium px-5 py-3">Statut</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {mockInvoices.map((inv) => (
                <tr key={inv.id} className="hover:bg-muted/30">
                  <td className="px-5 py-3 font-medium">{inv.number}</td>
                  <td className="px-5 py-3">{inv.customer}</td>
                  <td className="px-5 py-3 hidden sm:table-cell text-muted-foreground">{formatDate(inv.date)}</td>
                  <td className="px-5 py-3 text-right font-medium">{formatCurrency(inv.totalAmount)}</td>
                  <td className="px-5 py-3"><Badge tone={statusTone(inv.status) as never}>{inv.status}</Badge></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
