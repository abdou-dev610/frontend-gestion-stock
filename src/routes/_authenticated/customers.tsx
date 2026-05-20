import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Phone, Mail, MapPin, X, Pencil, Trash2, Loader2 } from "lucide-react";
import { Card, Badge, PageHeader, Button, SearchInput, Modal } from "@/components/common";
import { customerService } from "@/services/customerService";
import { formatCurrency, formatDate } from "@/lib/format";

export const Route = createFileRoute("/_authenticated/customers")({
  component: CustomersPage,
});

interface Customer {
  _id: string;
  fullName: string;
  phone: string;
  email: string;
  address: string;
  type: string;
  notes: string;
}

interface CustomerForm {
  fullName: string;
  phone: string;
  email: string;
  address: string;
  type: string;
  notes: string;
}

const emptyForm: CustomerForm = { fullName: "", phone: "", email: "", address: "", type: "particulier", notes: "" };

const typeLabel: Record<string, string> = { particulier: "Particulier", entreprise: "Entreprise", grossiste: "Grossiste" };
const typeTone = (t: string): "default" | "info" | "warning" =>
  t === "grossiste" ? "info" : t === "entreprise" ? "warning" : "default";

function CustomersPage() {
  const qc = useQueryClient();
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<Customer | null>(null);
  const [openAdd, setOpenAdd] = useState(false);
  const [editCustomer, setEditCustomer] = useState<Customer | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [form, setForm] = useState<CustomerForm>(emptyForm);
  const [formError, setFormError] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: ["customers", search],
    queryFn: () => customerService.list({ search: search || undefined }),
  });

  const { data: customerInvoices } = useQuery({
    queryKey: ["customer-invoices", selected?._id],
    queryFn: () => customerService.invoices(selected!._id),
    enabled: !!selected,
  });

  const customers: Customer[] = data?.data?.data || [];
  const invoices = customerInvoices?.data?.data || [];

  const createMutation = useMutation({
    mutationFn: (d: CustomerForm) => customerService.create(d),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["customers"] }); setOpenAdd(false); setForm(emptyForm); setFormError(""); },
    onError: (err: unknown) => setFormError((err as { response?: { data?: { message?: string } } })?.response?.data?.message || "Erreur"),
  });

  const updateMutation = useMutation({
    mutationFn: (d: CustomerForm) => customerService.update(editCustomer!._id, d),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["customers"] }); setEditCustomer(null); setForm(emptyForm); setFormError(""); },
    onError: (err: unknown) => setFormError((err as { response?: { data?: { message?: string } } })?.response?.data?.message || "Erreur"),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => customerService.remove(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["customers"] }); setDeleteId(null); },
  });

  const openEdit = (c: Customer) => {
    setEditCustomer(c);
    setForm({ fullName: c.fullName, phone: c.phone, email: c.email, address: c.address, type: c.type, notes: c.notes });
    setFormError("");
  };

  const handleSave = () => editCustomer ? updateMutation.mutate(form) : createMutation.mutate(form);
  const isSaving = createMutation.isPending || updateMutation.isPending;

  const inputCls = "w-full px-3 py-2 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring/40";

  const paymentLabel = (s: string) => s === "paid" ? "Payée" : s === "partial" ? "Partielle" : "Non payée";
  const paymentTone = (s: string): "success" | "warning" | "destructive" =>
    s === "paid" ? "success" : s === "partial" ? "warning" : "destructive";

  return (
    <div className="space-y-6">
      <PageHeader title="Gestion des clients" subtitle="Votre base clients en un coup d'œil"
        actions={<Button onClick={() => { setForm(emptyForm); setFormError(""); setOpenAdd(true); }}><Plus className="w-4 h-4" />Ajouter un client</Button>} />

      <Card className="p-4"><SearchInput placeholder="Rechercher un client..." value={search} onChange={setSearch} /></Card>

      <Card className="overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center py-16"><Loader2 className="w-8 h-8 animate-spin text-muted-foreground" /></div>
        ) : customers.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground text-sm">Aucun client trouvé</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[700px]">
              <thead className="bg-muted/50 text-muted-foreground text-xs uppercase">
                <tr>
                  <th className="text-left font-medium px-5 py-3">Nom complet</th>
                  <th className="text-left font-medium px-5 py-3">Téléphone</th>
                  <th className="text-left font-medium px-5 py-3 hidden md:table-cell">Email</th>
                  <th className="text-left font-medium px-5 py-3">Type</th>
                  <th className="text-right font-medium px-5 py-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {customers.map(c => (
                  <tr key={c._id} className="hover:bg-muted/30 cursor-pointer" onClick={() => setSelected(c)}>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-accent/15 text-accent flex items-center justify-center text-sm font-semibold">{c.fullName[0]}</div>
                        <div className="font-medium">{c.fullName}</div>
                      </div>
                    </td>
                    <td className="px-5 py-3 text-muted-foreground">{c.phone || "—"}</td>
                    <td className="px-5 py-3 text-muted-foreground hidden md:table-cell">{c.email || "—"}</td>
                    <td className="px-5 py-3"><Badge tone={typeTone(c.type)}>{typeLabel[c.type] || c.type}</Badge></td>
                    <td className="px-5 py-3">
                      <div className="flex items-center justify-end gap-1" onClick={e => e.stopPropagation()}>
                        <button onClick={() => openEdit(c)} className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground"><Pencil className="w-4 h-4" /></button>
                        <button onClick={() => setDeleteId(c._id)} className="p-1.5 rounded-lg hover:bg-destructive-soft text-destructive"><Trash2 className="w-4 h-4" /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Drawer détail */}
      {selected && (
        <div className="fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/50" onClick={() => setSelected(null)} />
          <div className="absolute right-0 top-0 bottom-0 w-full sm:max-w-md bg-card shadow-xl overflow-y-auto">
            <div className="flex items-center justify-between p-5 border-b border-border">
              <h3 className="font-semibold">Fiche client</h3>
              <button onClick={() => setSelected(null)} className="p-1 rounded-lg hover:bg-muted"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-5 space-y-5">
              <div className="flex items-center gap-3">
                <div className="w-14 h-14 rounded-full bg-accent/15 text-accent flex items-center justify-center text-xl font-bold">{selected.fullName[0]}</div>
                <div>
                  <div className="font-semibold">{selected.fullName}</div>
                  <Badge tone={typeTone(selected.type)}>{typeLabel[selected.type] || selected.type}</Badge>
                </div>
              </div>
              <div className="space-y-2 text-sm">
                {selected.phone && <div className="flex items-center gap-2 text-muted-foreground"><Phone className="w-4 h-4" />{selected.phone}</div>}
                {selected.email && <div className="flex items-center gap-2 text-muted-foreground"><Mail className="w-4 h-4" />{selected.email}</div>}
                {selected.address && <div className="flex items-center gap-2 text-muted-foreground"><MapPin className="w-4 h-4" />{selected.address}</div>}
              </div>
              <div>
                <h4 className="text-xs font-semibold uppercase text-muted-foreground mb-2">Historique des factures</h4>
                {invoices.length === 0 ? (
                  <p className="text-sm text-muted-foreground">Aucune facture</p>
                ) : (
                  <div className="space-y-2">
                    {invoices.slice(0, 5).map((inv: { _id: string; invoiceNumber: string; createdAt: string; totalAmount: number; paymentStatus: string }) => (
                      <div key={inv._id} className="flex items-center justify-between p-3 rounded-lg bg-muted/40">
                        <div>
                          <div className="text-sm font-medium">{inv.invoiceNumber}</div>
                          <div className="text-xs text-muted-foreground">{formatDate(inv.createdAt)}</div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-semibold">{formatCurrency(inv.totalAmount)}</div>
                          <Badge tone={paymentTone(inv.paymentStatus)}>{paymentLabel(inv.paymentStatus)}</Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Ajouter/Modifier */}
      <Modal open={openAdd || !!editCustomer} onClose={() => { setOpenAdd(false); setEditCustomer(null); setFormError(""); }}
        title={editCustomer ? "Modifier le client" : "Ajouter un client"}
        footer={<><Button variant="outline" onClick={() => { setOpenAdd(false); setEditCustomer(null); }}>Annuler</Button><Button onClick={handleSave} disabled={isSaving}>{isSaving ? "Enregistrement..." : "Enregistrer"}</Button></>}>
        {formError && <p className="text-sm text-destructive mb-3">{formError}</p>}
        <div className="space-y-4">
          <Field label="Nom complet *"><input className={inputCls} value={form.fullName} onChange={e => setForm({ ...form, fullName: e.target.value })} /></Field>
          <Field label="Téléphone"><input className={inputCls} value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} /></Field>
          <Field label="Email"><input type="email" className={inputCls} value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} /></Field>
          <Field label="Adresse"><input className={inputCls} value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} /></Field>
          <Field label="Type">
            <select className={inputCls} value={form.type} onChange={e => setForm({ ...form, type: e.target.value })}>
              <option value="particulier">Particulier</option>
              <option value="entreprise">Entreprise</option>
              <option value="grossiste">Grossiste</option>
            </select>
          </Field>
          <Field label="Notes"><textarea rows={2} className={inputCls} value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} /></Field>
        </div>
      </Modal>

      <Modal open={!!deleteId} onClose={() => setDeleteId(null)} title="Supprimer ce client ?"
        footer={<><Button variant="outline" onClick={() => setDeleteId(null)}>Annuler</Button><Button variant="danger" onClick={() => deleteMutation.mutate(deleteId!)} disabled={deleteMutation.isPending}>Supprimer</Button></>}>
        <p className="text-sm text-muted-foreground">Cette action est irréversible.</p>
      </Modal>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <label className="block"><span className="text-xs font-medium mb-1.5 block">{label}</span>{children}</label>;
}
