import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Eye, Pencil, Trash2, Loader2 } from "lucide-react";
import { Card, Badge, PageHeader, Button, SearchInput, Modal, Field } from "@/components/common";
import { getApiError } from "@/lib/apiError";
import { productService } from "@/services/productService";
import { formatCurrency } from "@/lib/format";

export const Route = createFileRoute("/_authenticated/products")({
  component: ProductsPage,
});

interface Product {
  _id: string;
  reference: string;
  name: string;
  category: string;
  purchasePrice: number;
  salePrice: number;
  quantity: number;
  alertThreshold: number;
  stockStatus: string;
  status: string;
  description?: string;
  image?: string;
}

interface ProductForm {
  name: string;
  reference: string;
  category: string;
  purchasePrice: string;
  salePrice: string;
  quantity: string;
  alertThreshold: string;
  description: string;
  image: string;
}

const emptyForm: ProductForm = { name: "", reference: "", category: "Alimentaire", purchasePrice: "", salePrice: "", quantity: "", alertThreshold: "10", description: "", image: "" };

const stockTone = (s: string): "success" | "warning" | "destructive" =>
  s === "En stock" ? "success" : s === "Stock faible" ? "warning" : "destructive";

function ProductsPage() {
  const qc = useQueryClient();
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [openAdd, setOpenAdd] = useState(false);
  const [editProduct, setEditProduct] = useState<Product | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [form, setForm] = useState<ProductForm>(emptyForm);
  const [formError, setFormError] = useState("");
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ["products", search, category, page],
    queryFn: () => productService.list({ search: search || undefined, category: category || undefined, page, limit: 50 }),
  });

  const products: Product[] = data?.data?.data || [];
  const pagination = data?.data?.pagination;
  const categories = Array.from(new Set(products.map(p => p.category)));

  const createMutation = useMutation({
    mutationFn: (d: ProductForm) => productService.create({ ...d, purchasePrice: Number(d.purchasePrice), salePrice: Number(d.salePrice), quantity: Number(d.quantity), alertThreshold: Number(d.alertThreshold) }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["products"] }); setOpenAdd(false); setForm(emptyForm); setFormError(""); },
    onError: (err: unknown) => setFormError(getApiError(err)),
  });

  const updateMutation = useMutation({
    mutationFn: (d: ProductForm) => productService.update(editProduct!._id, { ...d, purchasePrice: Number(d.purchasePrice), salePrice: Number(d.salePrice), quantity: Number(d.quantity), alertThreshold: Number(d.alertThreshold) }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["products"] }); setEditProduct(null); setForm(emptyForm); setFormError(""); },
    onError: (err: unknown) => setFormError(getApiError(err)),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => productService.remove(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["products"] }); setDeleteId(null); },
  });

  const openEdit = (p: Product) => {
    setEditProduct(p);
    setForm({ name: p.name, reference: p.reference, category: p.category, purchasePrice: String(p.purchasePrice), salePrice: String(p.salePrice), quantity: String(p.quantity), alertThreshold: String(p.alertThreshold), description: p.description || "", image: p.image || "" });
    setFormError("");
  };

  const handleAdd = () => { setForm(emptyForm); setFormError(""); setOpenAdd(true); };
  const handleSave = () => { formError && setFormError(""); editProduct ? updateMutation.mutate(form) : createMutation.mutate(form); };

  const inputCls = "w-full px-3 py-2 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring/40";
  const isSaving = createMutation.isPending || updateMutation.isPending;

  return (
    <div className="space-y-6">
      <PageHeader title="Gestion des produits" subtitle="Tous vos produits en un seul endroit"
        actions={<Button onClick={handleAdd}><Plus className="w-4 h-4" />Ajouter un produit</Button>} />

      <Card className="p-4 flex flex-col sm:flex-row gap-3">
        <SearchInput placeholder="Rechercher un produit..." value={search} onChange={(v) => { setSearch(v); setPage(1); }} />
        <select value={category} onChange={(e) => { setCategory(e.target.value); setPage(1); }}
          className="px-3 py-2 rounded-lg border border-input bg-card text-sm focus:outline-none focus:ring-2 focus:ring-ring/40">
          <option value="">Toutes catégories</option>
          {categories.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
      </Card>

      <Card className="overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center py-16"><Loader2 className="w-8 h-8 animate-spin text-muted-foreground" /></div>
        ) : products.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground text-sm">Aucun produit trouvé</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[800px]">
              <thead className="bg-muted/50 text-muted-foreground text-xs uppercase">
                <tr>
                  <th className="text-left font-medium px-5 py-3">Référence</th>
                  <th className="text-left font-medium px-5 py-3">Nom</th>
                  <th className="text-left font-medium px-5 py-3">Catégorie</th>
                  <th className="text-right font-medium px-5 py-3">Prix achat</th>
                  <th className="text-right font-medium px-5 py-3">Prix vente</th>
                  <th className="text-right font-medium px-5 py-3">Quantité</th>
                  <th className="text-left font-medium px-5 py-3">Statut</th>
                  <th className="text-right font-medium px-5 py-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {products.map(p => (
                  <tr key={p._id} className="hover:bg-muted/30">
                    <td className="px-5 py-3 font-mono text-xs text-muted-foreground">{p.reference}</td>
                    <td className="px-5 py-3 font-medium">{p.name}</td>
                    <td className="px-5 py-3 text-muted-foreground">{p.category}</td>
                    <td className="px-5 py-3 text-right">{formatCurrency(p.purchasePrice)}</td>
                    <td className="px-5 py-3 text-right font-medium">{formatCurrency(p.salePrice)}</td>
                    <td className="px-5 py-3 text-right">{p.quantity}</td>
                    <td className="px-5 py-3"><Badge tone={stockTone(p.stockStatus)}>{p.stockStatus}</Badge></td>
                    <td className="px-5 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={() => openEdit(p)} className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground"><Pencil className="w-4 h-4" /></button>
                        <button onClick={() => setDeleteId(p._id)} className="p-1.5 rounded-lg hover:bg-destructive-soft text-destructive"><Trash2 className="w-4 h-4" /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {pagination && pagination.total > 50 && (
        <div className="flex items-center justify-between text-sm text-muted-foreground px-1">
          <span>{pagination.total} produit{pagination.total > 1 ? "s" : ""}</span>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => setPage(p => p - 1)} disabled={page <= 1}>← Précédent</Button>
            <span className="text-xs">Page {page} / {Math.ceil(pagination.total / 50)}</span>
            <Button variant="outline" size="sm" onClick={() => setPage(p => p + 1)} disabled={page >= Math.ceil(pagination.total / 50)}>Suivant →</Button>
          </div>
        </div>
      )}

      {/* Modal Ajouter/Modifier */}
      <Modal open={openAdd || !!editProduct} onClose={() => { setOpenAdd(false); setEditProduct(null); setFormError(""); }}
        title={editProduct ? "Modifier le produit" : "Ajouter un produit"} size="lg"
        footer={<><Button variant="outline" onClick={() => { setOpenAdd(false); setEditProduct(null); }}>Annuler</Button><Button onClick={handleSave} disabled={isSaving}>{isSaving ? "Enregistrement..." : "Enregistrer"}</Button></>}>
        {formError && <p className="text-sm text-destructive mb-3">{formError}</p>}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Nom du produit"><input className={inputCls} value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Ex: Riz parfumé 50kg" /></Field>
          <Field label="Référence"><input className={inputCls} value={form.reference} onChange={e => setForm({ ...form, reference: e.target.value })} placeholder="PRD-XXX" /></Field>
          <Field label="Catégorie">
            <input className={inputCls} value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} placeholder="Ex: Alimentaire" />
          </Field>
          <Field label="Quantité en stock"><input type="number" className={inputCls} value={form.quantity} onChange={e => setForm({ ...form, quantity: e.target.value })} /></Field>
          <Field label="Prix d'achat (FCFA)"><input type="number" className={inputCls} value={form.purchasePrice} onChange={e => setForm({ ...form, purchasePrice: e.target.value })} /></Field>
          <Field label="Prix de vente (FCFA)"><input type="number" className={inputCls} value={form.salePrice} onChange={e => setForm({ ...form, salePrice: e.target.value })} /></Field>
          <Field label="Seuil d'alerte"><input type="number" className={inputCls} value={form.alertThreshold} onChange={e => setForm({ ...form, alertThreshold: e.target.value })} /></Field>
          <div className="sm:col-span-2"><Field label="Description"><textarea rows={2} className={inputCls} value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} /></Field></div>
          <div className="sm:col-span-2"><Field label="Image (URL)"><input type="url" className={inputCls} value={form.image} onChange={e => setForm({ ...form, image: e.target.value })} placeholder="https://..." /></Field></div>
        </div>
      </Modal>

      {/* Modal Supprimer */}
      <Modal open={!!deleteId} onClose={() => setDeleteId(null)} title="Supprimer ce produit ?"
        footer={<><Button variant="outline" onClick={() => setDeleteId(null)}>Annuler</Button><Button variant="danger" onClick={() => deleteMutation.mutate(deleteId!)} disabled={deleteMutation.isPending}>Supprimer</Button></>}>
        <p className="text-sm text-muted-foreground">Cette action est irréversible. Le produit sera définitivement supprimé.</p>
      </Modal>
    </div>
  );
}

const inputCls = "w-full px-3 py-2 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring/40";