import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Eye, Trash2, FileDown, Loader2 } from "lucide-react";
import { Card, Badge, PageHeader, Button, SearchInput, Modal } from "@/components/common";
import { invoiceService } from "@/services/invoiceService";
import { formatCurrency, formatDate } from "@/lib/format";

export const Route = createFileRoute("/_authenticated/invoices/")({
  component: InvoicesPage,
});

interface Invoice {
  _id: string;
  invoiceNumber: string;
  customer: { _id: string; fullName: string };
  createdAt: string;
  totalAmount: number;
  amountPaid: number;
  remainingAmount: number;
  paymentStatus: string;
}

const paymentLabel = (s: string) => s === "paid" ? "Payée" : s === "partial" ? "Partielle" : "Non payée";
const paymentTone = (s: string): "success" | "warning" | "destructive" =>
  s === "paid" ? "success" : s === "partial" ? "warning" : "destructive";

function InvoicesPage() {
  const qc = useQueryClient();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ["invoices", search, statusFilter, page],
    queryFn: () => invoiceService.list({ search: search || undefined, status: statusFilter || undefined, page, limit: 50 }),
  });

  const invoices: Invoice[] = data?.data?.data || [];
  const pagination = data?.data?.pagination;

  const deleteMutation = useMutation({
    mutationFn: (id: string) => invoiceService.remove(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["invoices"] }); setDeleteId(null); },
  });

  const handleDownloadPdf = async (id: string, number: string) => {
    setDownloadingId(id);
    try {
      const res = await invoiceService.pdf(id);
      const url = URL.createObjectURL(new Blob([res.data], { type: "application/pdf" }));
      const a = document.createElement("a");
      a.href = url;
      a.download = `${number}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } finally {
      setDownloadingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Facturation" subtitle="Toutes vos factures clients"
        actions={<Link to="/invoices/create"><Button><Plus className="w-4 h-4" />Nouvelle facture</Button></Link>} />

      <Card className="p-4 flex flex-col sm:flex-row gap-3">
        <SearchInput placeholder="Rechercher une facture..." value={search} onChange={(v) => { setSearch(v); setPage(1); }} />
        <select value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1); }}
          className="px-3 py-2 rounded-lg border border-input bg-card text-sm focus:outline-none focus:ring-2 focus:ring-ring/40">
          <option value="">Tous statuts</option>
          <option value="paid">Payées</option>
          <option value="partial">Partielles</option>
          <option value="unpaid">Non payées</option>
        </select>
      </Card>

      <Card className="overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center py-16"><Loader2 className="w-8 h-8 animate-spin text-muted-foreground" /></div>
        ) : invoices.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground text-sm">Aucune facture trouvée</div>
        ) : (
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
                {invoices.map(inv => (
                  <tr key={inv._id} className="hover:bg-muted/30">
                    <td className="px-5 py-3 font-medium">{inv.invoiceNumber}</td>
                    <td className="px-5 py-3">{inv.customer?.fullName || "—"}</td>
                    <td className="px-5 py-3 text-muted-foreground">{formatDate(inv.createdAt)}</td>
                    <td className="px-5 py-3 text-right font-medium">{formatCurrency(inv.totalAmount)}</td>
                    <td className="px-5 py-3 text-right text-success">{formatCurrency(inv.amountPaid)}</td>
                    <td className="px-5 py-3 text-right text-destructive">{formatCurrency(inv.remainingAmount)}</td>
                    <td className="px-5 py-3"><Badge tone={paymentTone(inv.paymentStatus)}>{paymentLabel(inv.paymentStatus)}</Badge></td>
                    <td className="px-5 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <Link to="/invoices/$id" params={{ id: inv._id }} className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground inline-flex"><Eye className="w-4 h-4" /></Link>
                        <button onClick={() => handleDownloadPdf(inv._id, inv.invoiceNumber)} disabled={downloadingId === inv._id}
                          className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground disabled:opacity-50">
                          {downloadingId === inv._id ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileDown className="w-4 h-4" />}
                        </button>
                        <button onClick={() => setDeleteId(inv._id)} className="p-1.5 rounded-lg hover:bg-destructive-soft text-destructive"><Trash2 className="w-4 h-4" /></button>
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
          <span>{pagination.total} facture{pagination.total > 1 ? "s" : ""}</span>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => setPage(p => p - 1)} disabled={page <= 1}>← Précédent</Button>
            <span className="text-xs">Page {page} / {Math.ceil(pagination.total / 50)}</span>
            <Button variant="outline" size="sm" onClick={() => setPage(p => p + 1)} disabled={page >= Math.ceil(pagination.total / 50)}>Suivant →</Button>
          </div>
        </div>
      )}

      <Modal open={!!deleteId} onClose={() => setDeleteId(null)} title="Supprimer cette facture ?"
        footer={<><Button variant="outline" onClick={() => setDeleteId(null)}>Annuler</Button><Button variant="danger" onClick={() => deleteMutation.mutate(deleteId!)} disabled={deleteMutation.isPending}>Supprimer</Button></>}>
        <p className="text-sm text-muted-foreground">Cette action est irréversible.</p>
      </Modal>
    </div>
  );
}
