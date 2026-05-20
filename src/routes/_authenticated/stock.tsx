import { createFileRoute } from "@tanstack/react-router";
import { Plus, Minus, History, Pencil, Trash2 } from "lucide-react";
import { Card, Badge, PageHeader, Button } from "@/components/common";
import { mockProducts, mockStockMovements, type Product } from "@/lib/mockData";
import { formatCurrency, formatDate } from "@/lib/format";

export const Route = createFileRoute("/_authenticated/stock")({
  component: StockPage,
});

const tone = (s: Product["status"]) => s === "En stock" ? "success" : s === "Stock faible" ? "warning" : "destructive";

function StockPage() {
  const stockValue = mockProducts.reduce((sum, p) => sum + p.purchasePrice * p.quantity, 0);
  const stockCount = mockProducts.reduce((sum, p) => sum + p.quantity, 0);
  const rupture = mockProducts.filter(p => p.status === "Rupture").length;

  return (
    <div className="space-y-6">
      <PageHeader title="Gestion du stock" subtitle="Suivez votre inventaire en temps réel"
        actions={<><Button><Plus className="w-4 h-4" />Ajouter stock</Button><Button variant="outline"><Minus className="w-4 h-4" />Réduire stock</Button><Button variant="ghost"><History className="w-4 h-4" />Mouvements</Button></>} />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <SummaryCard label="Valeur du stock" value={formatCurrency(stockValue)} tone="info" />
        <SummaryCard label="Produits en stock" value={stockCount.toString()} tone="success" />
        <SummaryCard label="Produits en rupture" value={rupture.toString()} tone="destructive" />
      </div>

      <Card className="overflow-hidden">
        <div className="p-5 border-b border-border"><h3 className="font-semibold">Inventaire</h3></div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[700px]">
            <thead className="bg-muted/50 text-muted-foreground text-xs uppercase">
              <tr>
                <th className="text-left font-medium px-5 py-3">Produit</th>
                <th className="text-right font-medium px-5 py-3">Quantité</th>
                <th className="text-right font-medium px-5 py-3">Seuil d'alerte</th>
                <th className="text-left font-medium px-5 py-3">Statut</th>
                <th className="text-right font-medium px-5 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {mockProducts.map(p => (
                <tr key={p.id} className="hover:bg-muted/30">
                  <td className="px-5 py-3 font-medium">{p.name}</td>
                  <td className="px-5 py-3 text-right">{p.quantity}</td>
                  <td className="px-5 py-3 text-right text-muted-foreground">{p.threshold}</td>
                  <td className="px-5 py-3"><Badge tone={tone(p.status)}>{p.status}</Badge></td>
                  <td className="px-5 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <button className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground"><Pencil className="w-4 h-4" /></button>
                      <button className="p-1.5 rounded-lg hover:bg-destructive-soft text-destructive"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <Card className="overflow-hidden">
        <div className="p-5 border-b border-border flex items-center justify-between">
          <h3 className="font-semibold">Derniers mouvements de stock</h3>
          <a href="#" className="text-xs text-accent hover:underline">Voir tout</a>
        </div>
        <div className="divide-y divide-border">
          {mockStockMovements.map(m => (
            <div key={m.id} className="flex items-center gap-4 px-5 py-4">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${m.quantity > 0 ? "bg-success-soft text-success" : "bg-destructive-soft text-destructive"}`}>
                {m.quantity > 0 ? <Plus className="w-4 h-4" /> : <Minus className="w-4 h-4" />}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-medium text-sm">{m.product}</div>
                <div className="text-xs text-muted-foreground">{m.type}{m.reference && ` — ${m.reference}`}</div>
              </div>
              <div className="text-right">
                <div className={`font-semibold text-sm ${m.quantity > 0 ? "text-success" : "text-destructive"}`}>{m.quantity > 0 ? "+" : ""}{m.quantity} unités</div>
                <div className="text-xs text-muted-foreground">{formatDate(m.date)}</div>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

function SummaryCard({ label, value, tone }: { label: string; value: string; tone: "info" | "success" | "destructive" }) {
  const tints = {
    info: "from-primary-soft to-transparent border-primary/20",
    success: "from-success-soft to-transparent border-success/20",
    destructive: "from-destructive-soft to-transparent border-destructive/20",
  };
  return (
    <Card className={`p-5 bg-gradient-to-br ${tints[tone]}`}>
      <div className="text-sm text-muted-foreground">{label}</div>
      <div className="text-2xl font-bold mt-2 text-foreground">{value}</div>
    </Card>
  );
}
