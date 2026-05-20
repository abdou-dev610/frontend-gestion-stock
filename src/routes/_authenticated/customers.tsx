import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Plus, Phone, Mail, MapPin, X, Eye, Pencil, Trash2 } from "lucide-react";
import { Card, Badge, PageHeader, Button, SearchInput, Modal } from "@/components/common";
import { mockCustomers, mockInvoices, type Customer } from "@/lib/mockData";
import { formatCurrency, formatDate } from "@/lib/format";

export const Route = createFileRoute("/_authenticated/customers")({
  component: CustomersPage,
});

function CustomersPage() {
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<Customer | null>(null);
  const [openAdd, setOpenAdd] = useState(false);

  const filtered = mockCustomers.filter(c => !search || c.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-6">
      <PageHeader title="Gestion des clients" subtitle="Votre base clients en un coup d'œil"
        actions={<Button onClick={() => setOpenAdd(true)}><Plus className="w-4 h-4" />Ajouter un client</Button>} />

      <Card className="p-4"><SearchInput placeholder="Rechercher un client..." value={search} onChange={setSearch} /></Card>

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[800px]">
            <thead className="bg-muted/50 text-muted-foreground text-xs uppercase">
              <tr>
                <th className="text-left font-medium px-5 py-3">Nom complet</th>
                <th className="text-left font-medium px-5 py-3">Téléphone</th>
                <th className="text-left font-medium px-5 py-3">Email</th>
                <th className="text-left font-medium px-5 py-3">Type</th>
                <th className="text-right font-medium px-5 py-3">Factures</th>
                <th className="text-right font-medium px-5 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.map(c => (
                <tr key={c.id} className="hover:bg-muted/30">
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-accent/15 text-accent flex items-center justify-center text-sm font-semibold">{c.name[0]}</div>
                      <div className="font-medium">{c.name}</div>
                    </div>
                  </td>
                  <td className="px-5 py-3 text-muted-foreground">{c.phone}</td>
                  <td className="px-5 py-3 text-muted-foreground">{c.email}</td>
                  <td className="px-5 py-3"><Badge tone={c.type === "Grossiste" ? "info" : "default"}>{c.type}</Badge></td>
                  <td className="px-5 py-3 text-right font-medium">{c.invoiceCount}</td>
                  <td className="px-5 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <button onClick={() => setSelected(c)} className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground"><Eye className="w-4 h-4" /></button>
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
                <div className="w-14 h-14 rounded-full bg-accent/15 text-accent flex items-center justify-center text-xl font-bold">{selected.name[0]}</div>
                <div>
                  <div className="font-semibold">{selected.name}</div>
                  <Badge tone={selected.type === "Grossiste" ? "info" : "default"}>{selected.type}</Badge>
                </div>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2 text-muted-foreground"><Phone className="w-4 h-4" />{selected.phone}</div>
                <div className="flex items-center gap-2 text-muted-foreground"><Mail className="w-4 h-4" />{selected.email}</div>
                <div className="flex items-center gap-2 text-muted-foreground"><MapPin className="w-4 h-4" />{selected.address}</div>
              </div>
              <div>
                <h4 className="text-xs font-semibold uppercase text-muted-foreground mb-2">Historique des factures</h4>
                <div className="space-y-2">
                  {mockInvoices.slice(0, 3).map(inv => (
                    <div key={inv.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/40">
                      <div>
                        <div className="text-sm font-medium">{inv.number}</div>
                        <div className="text-xs text-muted-foreground">{formatDate(inv.date)}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-semibold">{formatCurrency(inv.totalAmount)}</div>
                        <Badge tone={inv.status === "Payée" ? "success" : inv.status === "Partiellement payée" ? "warning" : "destructive"}>{inv.status}</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <Modal open={openAdd} onClose={() => setOpenAdd(false)} title="Ajouter un client"
        footer={<><Button variant="outline" onClick={() => setOpenAdd(false)}>Annuler</Button><Button onClick={() => setOpenAdd(false)}>Enregistrer</Button></>}>
        <div className="space-y-4">
          {["Nom complet", "Téléphone", "Email", "Adresse"].map(l => (
            <label key={l} className="block">
              <span className="text-xs font-medium mb-1.5 block">{l}</span>
              <input className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring/40" />
            </label>
          ))}
        </div>
      </Modal>
    </div>
  );
}
