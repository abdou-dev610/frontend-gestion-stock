import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Plus, Eye, Pencil, Trash2 } from "lucide-react";
import { Card, Badge, PageHeader, Button, SearchInput, Modal } from "@/components/common";
import { mockProducts, type Product } from "@/lib/mockData";
import { formatCurrency } from "@/lib/format";

export const Route = createFileRoute("/_authenticated/products")({
  component: ProductsPage,
});

const tone = (s: Product["status"]) => s === "En stock" ? "success" : s === "Stock faible" ? "warning" : "destructive";

function ProductsPage() {
  const [products, setProducts] = useState(mockProducts);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [openAdd, setOpenAdd] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const categories = Array.from(new Set(products.map(p => p.category)));
  const filtered = products.filter(p =>
    (!search || p.name.toLowerCase().includes(search.toLowerCase()) || p.reference.toLowerCase().includes(search.toLowerCase())) &&
    (!category || p.category === category)
  );

  const confirmDelete = () => {
    if (deleteId) setProducts(products.filter(p => p.id !== deleteId));
    setDeleteId(null);
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Gestion des produits" subtitle="Tous vos produits en un seul endroit"
        actions={<Button onClick={() => setOpenAdd(true)}><Plus className="w-4 h-4" />Ajouter un produit</Button>} />

      <Card className="p-4 flex flex-col sm:flex-row gap-3">
        <SearchInput placeholder="Rechercher un produit..." value={search} onChange={setSearch} />
        <select value={category} onChange={(e) => setCategory(e.target.value)}
          className="px-3 py-2 rounded-lg border border-input bg-card text-sm focus:outline-none focus:ring-2 focus:ring-ring/40">
          <option value="">Toutes catégories</option>
          {categories.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
      </Card>

      <Card className="overflow-hidden">
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
              {filtered.map(p => (
                <tr key={p.id} className="hover:bg-muted/30">
                  <td className="px-5 py-3 font-mono text-xs text-muted-foreground">{p.reference}</td>
                  <td className="px-5 py-3 font-medium">{p.name}</td>
                  <td className="px-5 py-3 text-muted-foreground">{p.category}</td>
                  <td className="px-5 py-3 text-right">{formatCurrency(p.purchasePrice)}</td>
                  <td className="px-5 py-3 text-right font-medium">{formatCurrency(p.salePrice)}</td>
                  <td className="px-5 py-3 text-right">{p.quantity}</td>
                  <td className="px-5 py-3"><Badge tone={tone(p.status)}>{p.status}</Badge></td>
                  <td className="px-5 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <button className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground"><Eye className="w-4 h-4" /></button>
                      <button className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground"><Pencil className="w-4 h-4" /></button>
                      <button onClick={() => setDeleteId(p.id)} className="p-1.5 rounded-lg hover:bg-destructive-soft text-destructive"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <Modal open={openAdd} onClose={() => setOpenAdd(false)} title="Ajouter un produit" size="lg"
        footer={<><Button variant="outline" onClick={() => setOpenAdd(false)}>Annuler</Button><Button onClick={() => setOpenAdd(false)}>Enregistrer</Button></>}>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Nom du produit"><input className={inputCls} placeholder="Ex: Riz parfumé 50kg" /></Field>
          <Field label="Référence"><input className={inputCls} placeholder="PRD-XXX" /></Field>
          <Field label="Catégorie">
            <select className={inputCls}><option>Alimentaire</option><option>Hygiène</option><option>Fourniture</option></select>
          </Field>
          <Field label="Quantité en stock"><input type="number" className={inputCls} /></Field>
          <Field label="Prix d'achat (FCFA)"><input type="number" className={inputCls} /></Field>
          <Field label="Prix de vente (FCFA)"><input type="number" className={inputCls} /></Field>
          <Field label="Seuil d'alerte"><input type="number" className={inputCls} /></Field>
          <Field label="Image produit"><input type="file" className={inputCls} /></Field>
          <div className="sm:col-span-2"><Field label="Description"><textarea rows={3} className={inputCls} /></Field></div>
        </div>
      </Modal>

      <Modal open={!!deleteId} onClose={() => setDeleteId(null)} title="Supprimer ce produit ?"
        footer={<><Button variant="outline" onClick={() => setDeleteId(null)}>Annuler</Button><Button variant="danger" onClick={confirmDelete}>Supprimer</Button></>}>
        <p className="text-sm text-muted-foreground">Cette action est irréversible. Le produit sera définitivement supprimé.</p>
      </Modal>
    </div>
  );
}

const inputCls = "w-full px-3 py-2 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring/40";
function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <label className="block"><span className="text-xs font-medium text-foreground mb-1.5 block">{label}</span>{children}</label>;
}
