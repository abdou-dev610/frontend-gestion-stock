import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Plus, Trash2, Save } from "lucide-react";
import { Card, PageHeader, Button } from "@/components/common";
import { getApiError } from "@/lib/apiError";
import { customerService } from "@/services/customerService";
import { productService } from "@/services/productService";
import { invoiceService } from "@/services/invoiceService";
import { formatCurrency } from "@/lib/format";

export const Route = createFileRoute("/_authenticated/invoices/create")({
  component: CreateInvoicePage,
});

interface Line { id: string; productId: string; quantity: number; unitPrice: number; }

function CreateInvoicePage() {
  const navigate = useNavigate();
  const [customerId, setCustomerId] = useState("");
  const [lines, setLines] = useState<Line[]>([{ id: "1", productId: "", quantity: 1, unitPrice: 0 }]);
  const [discount, setDiscount] = useState(0);
  const [paid, setPaid] = useState(0);
  const [method, setMethod] = useState<string>("cash");
  const [notes, setNotes] = useState("");
  const [saveError, setSaveError] = useState("");

  const { data: customersData } = useQuery({ queryKey: ["customers", { limit: 500 }], queryFn: () => customerService.list({ limit: 500 }) });
  const { data: productsData } = useQuery({ queryKey: ["products", { limit: 500 }], queryFn: () => productService.list({ limit: 500 }) });

  const customers = customersData?.data?.data || [];
  const products = productsData?.data?.data || [];

  const addLine = () => setLines([...lines, { id: String(Date.now()), productId: "", quantity: 1, unitPrice: 0 }]);
  const removeLine = (id: string) => setLines(lines.filter(l => l.id !== id));
  const updateLine = (id: string, patch: Partial<Line>) => setLines(lines.map(l => l.id === id ? { ...l, ...patch } : l));

  const selectProduct = (lineId: string, productId: string) => {
    const p = products.find((x: { _id: string; salePrice: number }) => x._id === productId);
    updateLine(lineId, { productId, unitPrice: p?.salePrice || 0 });
  };

  const subtotal = lines.reduce((s, l) => s + l.quantity * l.unitPrice, 0);
  const total = subtotal - discount;
  const remaining = total - paid;

  const validLines = lines.filter(l => l.productId);
  const hasDuplicateProducts = validLines.length !== new Set(validLines.map(l => l.productId)).size;
  const hasZeroPriceLine = validLines.some(l => l.unitPrice <= 0);

  const saveMutation = useMutation({
    mutationFn: () => {
      if (hasDuplicateProducts) throw new Error("Plusieurs lignes utilisent le même produit — fusionnez-les");
      if (hasZeroPriceLine) throw new Error("Tous les articles doivent avoir un prix unitaire supérieur à 0");
      return invoiceService.create({
        customerId,
        items: validLines.map(l => ({ productId: l.productId, quantity: l.quantity, unitPrice: l.unitPrice })),
        discount,
        amountPaid: paid,
        paymentMethod: method,
        notes,
      });
    },
    onSuccess: (res) => {
      const id = res.data?.data?._id;
      navigate({ to: id ? `/invoices/${id}` : "/invoices" });
    },
    onError: (err: unknown) => setSaveError(getApiError(err, "Erreur lors de la création")),
  });

  const inputCls = "w-full px-3 py-2 rounded-lg border border-input bg-card text-sm focus:outline-none focus:ring-2 focus:ring-ring/40";
  const methods = [
    { value: "cash", label: "Espèces" },
    { value: "wave", label: "Wave" },
    { value: "orange_money", label: "Orange Money" },
    { value: "bank_transfer", label: "Virement bancaire" },
  ];

  return (
    <div className="space-y-6">
      <PageHeader title="Créer une facture" subtitle="Composez votre facture en quelques clics"
        actions={<Link to="/invoices"><Button variant="ghost">← Retour</Button></Link>} />

      {saveError && (
        <div className="px-4 py-3 rounded-lg bg-destructive-soft border border-destructive/20 text-destructive text-sm">
          {saveError}
        </div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 space-y-6">
          <Card className="p-5">
            <h3 className="font-semibold mb-4">Client</h3>
            <select value={customerId} onChange={(e) => setCustomerId(e.target.value)} className={inputCls}>
              <option value="">Sélectionner un client</option>
              {customers.map((c: { _id: string; fullName: string }) => <option key={c._id} value={c._id}>{c.fullName}</option>)}
            </select>
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
                    const product = products.find((p: { _id: string; quantity: number }) => p._id === l.productId);
                    return (
                      <tr key={l.id}>
                        <td className="px-5 py-3">
                          <select value={l.productId} onChange={(e) => selectProduct(l.id, e.target.value)} className={inputCls}>
                            <option value="">Choisir un produit</option>
                            {products.map((p: { _id: string; name: string; quantity: number }) => (
                              <option key={p._id} value={p._id}>{p.name} (stock: {p.quantity})</option>
                            ))}
                          </select>
                          {product && product.quantity === 0 && (
                            <p className="text-xs text-destructive mt-1">Rupture de stock</p>
                          )}
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
              {methods.map(m => (
                <button key={m.value} onClick={() => setMethod(m.value)}
                  className={`px-3 py-2.5 rounded-lg border text-sm font-medium transition ${method === m.value ? "border-accent bg-accent/10 text-accent" : "border-border bg-card hover:bg-muted"}`}>
                  {m.label}
                </button>
              ))}
            </div>
          </Card>

          <Card className="p-5">
            <h3 className="font-semibold mb-3">Notes</h3>
            <textarea rows={2} className={inputCls} value={notes} onChange={e => setNotes(e.target.value)} placeholder="Notes ou instructions..." />
          </Card>
        </div>

        <div className="space-y-4">
          <Card className="p-5 space-y-3">
            <h3 className="font-semibold mb-2">Résumé</h3>
            <Row label="Sous-total" value={formatCurrency(subtotal)} />
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Réduction (FCFA)</span>
              <input type="number" min={0} value={discount} onChange={(e) => setDiscount(Number(e.target.value))} className="w-32 px-2 py-1 rounded-md border border-input bg-card text-right text-sm" />
            </div>
            <div className="border-t border-border pt-3"><Row label="Total" value={formatCurrency(total)} bold /></div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Montant payé</span>
              <input type="number" min={0} value={paid} onChange={(e) => setPaid(Number(e.target.value))} className="w-32 px-2 py-1 rounded-md border border-input bg-card text-right text-sm" />
            </div>
            <Row label="Reste à payer" value={formatCurrency(remaining)} highlight={remaining > 0 ? "destructive" : "success"} />
          </Card>

          {hasDuplicateProducts && <p className="text-xs text-destructive px-1">⚠ Produit en double — fusionnez les lignes identiques</p>}
          {hasZeroPriceLine && <p className="text-xs text-destructive px-1">⚠ Un ou plusieurs articles ont un prix unitaire à 0</p>}
          <Button className="w-full" onClick={() => saveMutation.mutate()} disabled={saveMutation.isPending || !customerId || validLines.length === 0 || hasDuplicateProducts || hasZeroPriceLine}>
            <Save className="w-4 h-4" />{saveMutation.isPending ? "Enregistrement..." : "Enregistrer la facture"}
          </Button>
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
