import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Plus, Trash2, Save, FileDown, Printer, UserPlus } from "lucide-react";
import { Card, PageHeader, Button } from "@/components/common";
import { mockCustomers, mockProducts } from "@/lib/mockData";
import { formatCurrency } from "@/lib/format";

export const Route = createFileRoute("/_authenticated/invoices/create")({
  component: CreateInvoicePage,
});

interface Line { id: string; productId: string; quantity: number; unitPrice: number; }

function CreateInvoicePage() {
  const [customerId, setCustomerId] = useState("");
  const [lines, setLines] = useState<Line[]>([{ id: "1", productId: "1", quantity: 2, unitPrice: 22000 }]);
  const [discount, setDiscount] = useState(0);
  const [paid, setPaid] = useState(0);
  const [method, setMethod] = useState("Espèces");

  const addLine = () => setLines([...lines, { id: String(Date.now()), productId: mockProducts[0].id, quantity: 1, unitPrice: mockProducts[0].salePrice }]);
  const removeLine = (id: string) => setLines(lines.filter(l => l.id !== id));
  const updateLine = (id: string, patch: Partial<Line>) => setLines(lines.map(l => l.id === id ? { ...l, ...patch } : l));

  const subtotal = lines.reduce((s, l) => s + l.quantity * l.unitPrice, 0);
  const total = subtotal - discount;
  const remaining = total - paid;

  const inputCls = "w-full px-3 py-2 rounded-lg border border-input bg-card text-sm focus:outline-none focus:ring-2 focus:ring-ring/40";

  return (
    <div className="space-y-6">
      <PageHeader title="Créer une facture" subtitle="Composez votre facture en quelques clics"
        actions={<Link to="/invoices"><Button variant="ghost">← Retour</Button></Link>} />

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 space-y-6">
          <Card className="p-5">
            <h3 className="font-semibold mb-4">Client</h3>
            <div className="flex flex-col sm:flex-row gap-3">
              <select value={customerId} onChange={(e) => setCustomerId(e.target.value)} className={inputCls + " flex-1"}>
                <option value="">Sélectionner un client</option>
                {mockCustomers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
              <Button variant="outline"><UserPlus className="w-4 h-4" />Nouveau client</Button>
            </div>
          </Card>

          <Card className="overflow-hidden">
            <div className="flex items-center justify-between p-5 border-b border-border">
              <h3 className="font-semibold">Produits</h3>
              <Button size="sm" onClick={addLine}><Plus className="w-3 h-3" />Ajouter</Button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm min-w-[700px]">
                <thead className="bg-muted/40 text-xs uppercase text-muted-foreground">
                  <tr>
                    <th className="text-left font-medium px-5 py-3">Produit</th>
                    <th className="text-right font-medium px-5 py-3 w-24">Quantité</th>
                    <th className="text-right font-medium px-5 py-3 w-36">Prix unitaire</th>
                    <th className="text-right font-medium px-5 py-3 w-36">Total</th>
                    <th className="w-12"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {lines.map(l => {
                    const product = mockProducts.find(p => p.id === l.productId);
                    return (
                      <tr key={l.id}>
                        <td className="px-5 py-3">
                          <select value={l.productId} onChange={(e) => { const p = mockProducts.find(x => x.id === e.target.value)!; updateLine(l.id, { productId: e.target.value, unitPrice: p.salePrice }); }} className={inputCls}>
                            {mockProducts.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                          </select>
                        </td>
                        <td className="px-5 py-3"><input type="number" min={1} value={l.quantity} onChange={(e) => updateLine(l.id, { quantity: Number(e.target.value) })} className={inputCls + " text-right"} /></td>
                        <td className="px-5 py-3"><input type="number" value={l.unitPrice} onChange={(e) => updateLine(l.id, { unitPrice: Number(e.target.value) })} className={inputCls + " text-right"} /></td>
                        <td className="px-5 py-3 text-right font-medium">{formatCurrency(l.quantity * l.unitPrice)}</td>
                        <td className="px-3 py-3"><button onClick={() => removeLine(l.id)} className="p-1.5 rounded-lg hover:bg-destructive-soft text-destructive"><Trash2 className="w-4 h-4" /></button></td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </Card>

          <Card className="p-5">
            <h3 className="font-semibold mb-3">Méthode de paiement</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {["Espèces", "Wave", "Orange Money", "Virement bancaire"].map(m => (
                <button key={m} onClick={() => setMethod(m)}
                  className={`px-3 py-2.5 rounded-lg border text-sm font-medium transition ${method === m ? "border-accent bg-accent/10 text-accent" : "border-border bg-card hover:bg-muted"}`}>
                  {m}
                </button>
              ))}
            </div>
          </Card>
        </div>

        <div className="space-y-4">
          <Card className="p-5 space-y-3">
            <h3 className="font-semibold mb-2">Résumé</h3>
            <Row label="Sous-total" value={formatCurrency(subtotal)} />
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Réduction</span>
              <input type="number" value={discount} onChange={(e) => setDiscount(Number(e.target.value))} className="w-32 px-2 py-1 rounded-md border border-input bg-card text-right text-sm" />
            </div>
            <div className="border-t border-border pt-3"><Row label="Total" value={formatCurrency(total)} bold /></div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Montant payé</span>
              <input type="number" value={paid} onChange={(e) => setPaid(Number(e.target.value))} className="w-32 px-2 py-1 rounded-md border border-input bg-card text-right text-sm" />
            </div>
            <Row label="Reste à payer" value={formatCurrency(remaining)} highlight={remaining > 0 ? "destructive" : "success"} />
          </Card>

          <div className="flex flex-col gap-2">
            <Button><Save className="w-4 h-4" />Enregistrer facture</Button>
            <Button variant="outline"><FileDown className="w-4 h-4" />Générer PDF</Button>
            <Button variant="ghost"><Printer className="w-4 h-4" />Imprimer</Button>
          </div>
        </div>
      </div>
    </div>
  );
}

function Row({ label, value, bold, highlight }: { label: string; value: string; bold?: boolean; highlight?: "success" | "destructive" }) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className={`${bold ? "text-lg font-bold" : "font-medium"} ${highlight === "destructive" ? "text-destructive" : highlight === "success" ? "text-success" : "text-foreground"}`}>{value}</span>
    </div>
  );
}
