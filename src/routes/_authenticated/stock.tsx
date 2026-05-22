import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Minus, History, Loader2, ArrowUpCircle, ArrowDownCircle, RefreshCw } from "lucide-react";
import { Card, Badge, PageHeader, Button, Modal } from "@/components/common";
import { stockService } from "@/services/stockService";
import { getApiError } from "@/lib/apiError";
import { formatCurrency, formatDate } from "@/lib/format";

export const Route = createFileRoute("/_authenticated/stock")({
  component: StockPage,
});

interface Product {
  _id: string;
  name: string;
  reference: string;
  category: string;
  quantity: number;
  alertThreshold: number;
  purchasePrice: number;
  stockStatus: string;
}

interface Movement {
  _id: string;
  product: { _id: string; name: string; reference: string };
  type: string;
  quantity: number;
  previousQuantity: number;
  newQuantity: number;
  reason: string;
  createdAt: string;
}

const stockTone = (s: string): "success" | "warning" | "destructive" =>
  s === "En stock" ? "success" : s === "Stock faible" ? "warning" : "destructive";

const typeLabel: Record<string, string> = { in: "Entrée", out: "Sortie", adjustment: "Ajustement", sale: "Vente facture" };
const typeIcon: Record<string, typeof Plus> = { in: ArrowUpCircle, out: ArrowDownCircle, sale: ArrowDownCircle, adjustment: RefreshCw };

function StockPage() {
  const qc = useQueryClient();
  const [showHistory, setShowHistory] = useState(false);
  const [movementModal, setMovementModal] = useState<{ type: "in" | "out" | "adjustment" } | null>(null);
  const [productId, setProductId] = useState("");
  const [quantity, setQuantity] = useState("");
  const [reason, setReason] = useState("");
  const [movError, setMovError] = useState("");

  const { data: stockData, isLoading } = useQuery({ queryKey: ["stock"], queryFn: () => stockService.list() });
  const [movPage, setMovPage] = useState(1);
  const { data: movData } = useQuery({ queryKey: ["stock-movements", movPage], queryFn: () => stockService.movements({ page: movPage, limit: 50 }), enabled: showHistory });

  const products: Product[] = stockData?.data?.data || [];
  const movements: Movement[] = movData?.data?.data || [];
  const movPagination = movData?.data?.pagination;

  const stockValue = products.reduce((s, p) => s + p.purchasePrice * p.quantity, 0);
  const totalUnits = products.reduce((s, p) => s + p.quantity, 0);
  const rupture = products.filter(p => p.quantity === 0).length;

  const movMutation = useMutation({
    mutationFn: () => stockService.addMovement({ productId, type: movementModal!.type, quantity: Number(quantity), reason }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["stock"] });
      qc.invalidateQueries({ queryKey: ["stock-movements"] });
      setMovementModal(null);
      setProductId(""); setQuantity(""); setReason(""); setMovError("");
    },
    onError: (err: unknown) => setMovError(getApiError(err)),
  });

  const inputCls = "w-full px-3 py-2 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring/40";

  return (
    <div className="space-y-6">
      <PageHeader title="Gestion du stock" subtitle="Suivez votre inventaire en temps réel"
        actions={<>
          <Button onClick={() => { setMovementModal({ type: "in" }); setMovError(""); }}><Plus className="w-4 h-4" />Entrée stock</Button>
          <Button variant="outline" onClick={() => { setMovementModal({ type: "out" }); setMovError(""); }}><Minus className="w-4 h-4" />Sortie stock</Button>
          <Button variant="ghost" onClick={() => { setShowHistory(!showHistory); setMovPage(1); }}><History className="w-4 h-4" />Mouvements</Button>
        </>} />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <SummaryCard label="Valeur du stock" value={formatCurrency(stockValue)} tone="info" />
        <SummaryCard label="Unités en stock" value={totalUnits.toString()} tone="success" />
        <SummaryCard label="Produits en rupture" value={rupture.toString()} tone="destructive" />
      </div>

      <Card className="overflow-hidden">
        <div className="p-5 border-b border-border"><h3 className="font-semibold">Inventaire</h3></div>
        {isLoading ? (
          <div className="flex items-center justify-center py-16"><Loader2 className="w-8 h-8 animate-spin text-muted-foreground" /></div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[600px]">
              <thead className="bg-muted/50 text-muted-foreground text-xs uppercase">
                <tr>
                  <th className="text-left font-medium px-5 py-3">Produit</th>
                  <th className="text-left font-medium px-5 py-3 hidden sm:table-cell">Catégorie</th>
                  <th className="text-right font-medium px-5 py-3">Quantité</th>
                  <th className="text-right font-medium px-5 py-3">Seuil d'alerte</th>
                  <th className="text-left font-medium px-5 py-3">Statut</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {products.map(p => (
                  <tr key={p._id} className="hover:bg-muted/30">
                    <td className="px-5 py-3 font-medium">{p.name}</td>
                    <td className="px-5 py-3 text-muted-foreground hidden sm:table-cell">{p.category}</td>
                    <td className="px-5 py-3 text-right">{p.quantity}</td>
                    <td className="px-5 py-3 text-right text-muted-foreground">{p.alertThreshold}</td>
                    <td className="px-5 py-3"><Badge tone={stockTone(p.stockStatus)}>{p.stockStatus}</Badge></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {showHistory && (
        <Card className="overflow-hidden">
          <div className="p-5 border-b border-border"><h3 className="font-semibold">Historique des mouvements</h3></div>
          <div className="divide-y divide-border">
            {movements.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">Aucun mouvement</p>
            ) : movements.map(m => {
              const Icon = typeIcon[m.type] || RefreshCw;
              const isIn = m.type === "in" || m.type === "adjustment";
              return (
                <div key={m._id} className="flex items-center gap-4 px-5 py-4">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${isIn ? "bg-success-soft text-success" : "bg-destructive-soft text-destructive"}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm">{m.product?.name || "—"}</div>
                    <div className="text-xs text-muted-foreground">{typeLabel[m.type] || m.type}{m.reason && ` — ${m.reason}`}</div>
                  </div>
                  <div className="text-right">
                    <div className={`font-semibold text-sm ${isIn ? "text-success" : "text-destructive"}`}>
                      {isIn ? "+" : "-"}{m.quantity} unités
                    </div>
                    <div className="text-xs text-muted-foreground">{m.previousQuantity} → {m.newQuantity}</div>
                    <div className="text-xs text-muted-foreground">{formatDate(m.createdAt)}</div>
                  </div>
                </div>
              );
            })}
          </div>
          {movPagination && movPagination.total > 50 && (
            <div className="flex items-center justify-between text-sm text-muted-foreground p-4 border-t border-border">
              <span>{movPagination.total} mouvement{movPagination.total > 1 ? "s" : ""}</span>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={() => setMovPage(p => p - 1)} disabled={movPage <= 1}>← Précédent</Button>
                <span className="text-xs">Page {movPage} / {Math.ceil(movPagination.total / 50)}</span>
                <Button variant="outline" size="sm" onClick={() => setMovPage(p => p + 1)} disabled={movPage >= Math.ceil(movPagination.total / 50)}>Suivant →</Button>
              </div>
            </div>
          )}
        </Card>
      )}

      <Modal open={!!movementModal} onClose={() => { setMovementModal(null); setMovError(""); }}
        title={movementModal?.type === "in" ? "Ajouter au stock" : "Sortie de stock"}
        footer={<>
          <Button variant="outline" onClick={() => setMovementModal(null)}>Annuler</Button>
          <Button onClick={() => movMutation.mutate()} disabled={movMutation.isPending || !productId || !quantity}>
            {movMutation.isPending ? "En cours..." : "Confirmer"}
          </Button>
        </>}>
        {movError && <p className="text-sm text-destructive mb-3">{movError}</p>}
        <div className="space-y-4">
          <label className="block">
            <span className="text-xs font-medium mb-1.5 block">Produit</span>
            <select className={inputCls} value={productId} onChange={e => setProductId(e.target.value)}>
              <option value="">Sélectionner un produit</option>
              {products.map(p => <option key={p._id} value={p._id}>{p.name} (stock: {p.quantity})</option>)}
            </select>
          </label>
          <label className="block">
            <span className="text-xs font-medium mb-1.5 block">Quantité</span>
            <input type="number" min={1} className={inputCls} value={quantity} onChange={e => setQuantity(e.target.value)} />
          </label>
          <label className="block">
            <span className="text-xs font-medium mb-1.5 block">Raison (optionnel)</span>
            <input className={inputCls} value={reason} onChange={e => setReason(e.target.value)} placeholder="Ex: Réception fournisseur" />
          </label>
        </div>
      </Modal>
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
