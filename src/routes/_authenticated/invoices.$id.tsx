import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, FileDown, Printer, Package } from "lucide-react";
import { Card, Badge, Button } from "@/components/common";
import { mockInvoices, mockProducts } from "@/lib/mockData";
import { formatCurrency, formatDate } from "@/lib/format";

export const Route = createFileRoute("/_authenticated/invoices/$id")({
  component: InvoiceDetail,
});

function InvoiceDetail() {
  const { id } = Route.useParams();
  const invoice = mockInvoices.find(i => i.id === id) || mockInvoices[0];
  const items = [
    { product: mockProducts[0], qty: 2 },
    { product: mockProducts[1], qty: 6 },
  ];
  const subtotal = items.reduce((s, i) => s + i.product.salePrice * i.qty, 0);

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex flex-wrap items-center justify-between gap-3 print:hidden">
        <Link to="/invoices"><Button variant="ghost"><ArrowLeft className="w-4 h-4" />Retour</Button></Link>
        <div className="flex gap-2">
          <Button variant="outline"><FileDown className="w-4 h-4" />Télécharger PDF</Button>
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
            <div className="text-xs text-muted-foreground space-y-0.5">
              <div>StockFact Pro SARL</div>
              <div>RCCM SN-DKR-2020-B-12345</div>
              <div>NINEA: 123456789</div>
              <div>Tél: 77 123 45 67</div>
              <div>contact@stockfact.sn</div>
            </div>
          </div>
          <div className="sm:text-right">
            <div className="text-3xl font-bold tracking-tight">FACTURE</div>
            <div className="font-mono text-sm text-muted-foreground mt-1">N° {invoice.number}</div>
            <div className="text-sm text-muted-foreground mt-2">Date: {formatDate(invoice.date)}</div>
            <div className="mt-3"><Badge tone={invoice.status === "Payée" ? "success" : invoice.status === "Partiellement payée" ? "warning" : "destructive"}>{invoice.status}</Badge></div>
          </div>
        </div>

        <div className="py-6">
          <div className="text-xs font-semibold uppercase text-muted-foreground mb-2">Facturé à</div>
          <div className="font-semibold">{invoice.customer}</div>
          <div className="text-sm text-muted-foreground">Tél: 77 123 45 67 · Dakar, Sénégal</div>
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
              {items.map((i) => (
                <tr key={i.product.id}>
                  <td className="px-4 py-3 font-medium">{i.product.name}</td>
                  <td className="px-4 py-3 text-right">{i.qty}</td>
                  <td className="px-4 py-3 text-right">{formatCurrency(i.product.salePrice)}</td>
                  <td className="px-4 py-3 text-right font-medium">{formatCurrency(i.qty * i.product.salePrice)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex justify-end mt-6">
          <div className="w-full sm:w-72 space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-muted-foreground">Sous-total</span><span className="font-medium">{formatCurrency(subtotal)}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Réduction</span><span>0 FCFA</span></div>
            <div className="flex justify-between pt-2 border-t border-border"><span className="font-semibold">Total</span><span className="font-bold text-lg">{formatCurrency(invoice.totalAmount)}</span></div>
            <div className="flex justify-between text-success"><span>Montant payé</span><span className="font-medium">{formatCurrency(invoice.paidAmount)}</span></div>
            <div className="flex justify-between text-destructive"><span>Reste à payer</span><span className="font-medium">{formatCurrency(invoice.totalAmount - invoice.paidAmount)}</span></div>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-border text-center text-sm text-muted-foreground">
          Merci pour votre confiance ! <br />
          <span className="text-xs">Le meilleur partenaire de votre réussite.</span>
        </div>
      </Card>
    </div>
  );
}
