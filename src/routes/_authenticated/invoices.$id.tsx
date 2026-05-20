import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, FileDown, Printer, Package, Loader2 } from "lucide-react";
import { Card, Badge, Button } from "@/components/common";
import { invoiceService } from "@/services/invoiceService";
import { formatCurrency, formatDate } from "@/lib/format";
import { useState } from "react";

export const Route = createFileRoute("/_authenticated/invoices/$id")({
  component: InvoiceDetail,
});

const paymentLabel = (s: string) => s === "paid" ? "Payée" : s === "partial" ? "Partielle" : "Non payée";
const paymentTone = (s: string): "success" | "warning" | "destructive" =>
  s === "paid" ? "success" : s === "partial" ? "warning" : "destructive";

interface InvoiceItem { productName: string; quantity: number; unitPrice: number; total: number; }
interface InvoiceData {
  _id: string;
  invoiceNumber: string;
  customer: { fullName: string; phone: string; email: string; address: string };
  items: InvoiceItem[];
  subtotal: number;
  discount: number;
  totalAmount: number;
  amountPaid: number;
  remainingAmount: number;
  paymentStatus: string;
  paymentMethod: string;
  notes: string;
  createdAt: string;
}

function InvoiceDetail() {
  const { id } = Route.useParams();
  const [downloading, setDownloading] = useState(false);

  const { data, isLoading, isError } = useQuery({
    queryKey: ["invoice", id],
    queryFn: () => invoiceService.get(id),
  });

  const invoice: InvoiceData | null = data?.data?.data || null;

  const handleDownload = async () => {
    if (!invoice) return;
    setDownloading(true);
    try {
      const res = await invoiceService.pdf(invoice._id);
      const url = URL.createObjectURL(new Blob([res.data], { type: "application/pdf" }));
      const a = document.createElement("a");
      a.href = url;
      a.download = `${invoice.invoiceNumber}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } finally { setDownloading(false); }
  };

  if (isLoading) return (
    <div className="flex items-center justify-center py-32">
      <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
    </div>
  );

  if (isError || !invoice) return (
    <div className="text-center py-16">
      <p className="text-muted-foreground">Facture introuvable</p>
      <Link to="/invoices"><Button variant="ghost" className="mt-4">← Retour</Button></Link>
    </div>
  );

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex flex-wrap items-center justify-between gap-3 print:hidden">
        <Link to="/invoices"><Button variant="ghost"><ArrowLeft className="w-4 h-4" />Retour</Button></Link>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleDownload} disabled={downloading}>
            {downloading ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileDown className="w-4 h-4" />}
            Télécharger PDF
          </Button>
          <Button onClick={() => window.print()}><Printer className="w-4 h-4" />Imprimer</Button>
        </div>
      </div>

      <Card className="p-6 sm:p-10 print:shadow-none print:border-0">
        <div className="flex flex-col sm:flex-row justify-between gap-6 pb-8 border-b border-border">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-10 h-10 rounded-lg bg-accent text-accent-foreground flex items-center justify-center"><Package className="w-5 h-5" /></div>
              <div>
                <div className="font-bold text-lg">StockFact <span className="text-accent">Pro</span></div>
                <div className="text-xs text-muted-foreground">ERP de facturation</div>
              </div>
            </div>
          </div>
          <div className="sm:text-right">
            <div className="text-3xl font-bold tracking-tight">FACTURE</div>
            <div className="font-mono text-sm text-muted-foreground mt-1">N° {invoice.invoiceNumber}</div>
            <div className="text-sm text-muted-foreground mt-2">Date: {formatDate(invoice.createdAt)}</div>
            <div className="mt-3"><Badge tone={paymentTone(invoice.paymentStatus)}>{paymentLabel(invoice.paymentStatus)}</Badge></div>
          </div>
        </div>

        <div className="py-6">
          <div className="text-xs font-semibold uppercase text-muted-foreground mb-2">Facturé à</div>
          <div className="font-semibold">{invoice.customer?.fullName}</div>
          {invoice.customer?.phone && <div className="text-sm text-muted-foreground">Tél: {invoice.customer.phone}</div>}
          {invoice.customer?.email && <div className="text-sm text-muted-foreground">{invoice.customer.email}</div>}
          {invoice.customer?.address && <div className="text-sm text-muted-foreground">{invoice.customer.address}</div>}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/40 text-xs uppercase text-muted-foreground">
              <tr>
                <th className="text-left font-medium px-4 py-3">Produit</th>
                <th className="text-right font-medium px-4 py-3">Qté</th>
                <th className="text-right font-medium px-4 py-3">Prix unitaire</th>
                <th className="text-right font-medium px-4 py-3">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {invoice.items.map((item, i) => (
                <tr key={i}>
                  <td className="px-4 py-3 font-medium">{item.productName}</td>
                  <td className="px-4 py-3 text-right">{item.quantity}</td>
                  <td className="px-4 py-3 text-right">{formatCurrency(item.unitPrice)}</td>
                  <td className="px-4 py-3 text-right font-medium">{formatCurrency(item.total)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex justify-end mt-6">
          <div className="w-full sm:w-72 space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-muted-foreground">Sous-total</span><span className="font-medium">{formatCurrency(invoice.subtotal)}</span></div>
            {invoice.discount > 0 && <div className="flex justify-between"><span className="text-muted-foreground">Réduction</span><span>-{formatCurrency(invoice.discount)}</span></div>}
            <div className="flex justify-between pt-2 border-t border-border"><span className="font-semibold">Total</span><span className="font-bold text-lg">{formatCurrency(invoice.totalAmount)}</span></div>
            <div className="flex justify-between text-success"><span>Montant payé</span><span className="font-medium">{formatCurrency(invoice.amountPaid)}</span></div>
            <div className="flex justify-between text-destructive"><span>Reste à payer</span><span className="font-medium">{formatCurrency(invoice.remainingAmount)}</span></div>
          </div>
        </div>

        {invoice.notes && (
          <div className="mt-6 p-3 rounded-lg bg-muted/40 text-sm text-muted-foreground">
            <strong>Notes:</strong> {invoice.notes}
          </div>
        )}

        <div className="mt-10 pt-6 border-t border-border text-center text-sm text-muted-foreground">
          Merci pour votre confiance !
        </div>
      </Card>
    </div>
  );
}
