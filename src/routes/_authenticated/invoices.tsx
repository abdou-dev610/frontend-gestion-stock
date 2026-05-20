import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Plus, Eye, Pencil, Trash2 } from "lucide-react";
import { Card, Badge, PageHeader, Button, SearchInput } from "@/components/common";
import { mockInvoices } from "@/lib/mockData";
import { formatCurrency, formatDate } from "@/lib/format";

export const Route = createFileRoute("/_authenticated/invoices")({
  component: InvoicesPage,
});

function InvoicesPage() {
  const [search, setSearch] = useState("");
  const filtered = mockInvoices.filter(i => !search || i.number.toLowerCase().includes(search.toLowerCase()) || i.customer.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-6">
      <PageHeader title="Facturation" subtitle="Toutes vos factures clients"
        actions={<Link to="/invoices/create"><Button><Plus className="w-4 h-4" />Nouvelle facture</Button></Link>} />

      <Card className="p-4"><SearchInput placeholder="Rechercher une facture..." value={search} onChange={setSearch} /></Card>

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[900px]">
            <thead className="bg-muted/50 text-muted-foreground text-xs uppercase">
              <tr>
                <th className="text-left font-medium px-5 py-3">N° Facture</th>
                <th className="text-left font-medium px-5 py-3">Client</th>
                <th className="text-left font-medium px-5 py-3">Date</th>
                <th className="text-right font-medium px-5 py-3">Total</th>
                <th className="text-right font-medium px-5 py-3">Payé</th>
                <th className="text-right font-medium px-5 py-3">Reste</th>
                <th className="text-left font-medium px-5 py-3">Statut</th>
                <th className="text-right font-medium px-5 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.map(inv => (
                <tr key={inv.id} className="hover:bg-muted/30">
                  <td className="px-5 py-3 font-medium">{inv.number}</td>
                  <td className="px-5 py-3">{inv.customer}</td>
                  <td className="px-5 py-3 text-muted-foreground">{formatDate(inv.date)}</td>
                  <td className="px-5 py-3 text-right font-medium">{formatCurrency(inv.totalAmount)}</td>
                  <td className="px-5 py-3 text-right text-success">{formatCurrency(inv.paidAmount)}</td>
                  <td className="px-5 py-3 text-right text-destructive">{formatCurrency(inv.totalAmount - inv.paidAmount)}</td>
                  <td className="px-5 py-3"><Badge tone={inv.status === "Payée" ? "success" : inv.status === "Partiellement payée" ? "warning" : "destructive"}>{inv.status}</Badge></td>
                  <td className="px-5 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <Link to="/invoices/$id" params={{ id: inv.id }} className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground"><Eye className="w-4 h-4" /></Link>
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
    </div>
  );
}
