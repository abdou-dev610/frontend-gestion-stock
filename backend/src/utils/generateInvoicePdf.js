import PDFDocument from "pdfkit";

const formatCFA = (n) => new Intl.NumberFormat("fr-FR").format(n) + " FCFA";
const fmt = (d) => new Date(d).toLocaleDateString("fr-FR");

export const generateInvoicePdf = (invoice, settings, res) => {
  const doc = new PDFDocument({ margin: 50, size: "A4" });

  res.setHeader("Content-Type", "application/pdf");
  res.setHeader(
    "Content-Disposition",
    `attachment; filename="${invoice.invoiceNumber}.pdf"`
  );
  doc.pipe(res);

  // Header
  doc.fontSize(22).font("Helvetica-Bold").text(settings.companyName || "StockFact Pro", 50, 50);
  doc.fontSize(10).font("Helvetica").fillColor("#555");
  if (settings.phone) doc.text(`Tél: ${settings.phone}`, 50, 80);
  if (settings.email) doc.text(`Email: ${settings.email}`, 50, 93);
  if (settings.address) doc.text(`Adresse: ${settings.address}`, 50, 106);
  if (settings.ninea) doc.text(`NINEA: ${settings.ninea}`, 50, 119);
  if (settings.rccm) doc.text(`RCCM: ${settings.rccm}`, 50, 132);

  // Invoice title
  doc.fillColor("#1e40af").fontSize(18).font("Helvetica-Bold")
    .text("FACTURE", 400, 50, { align: "right" });
  doc.fillColor("#111").fontSize(11).font("Helvetica")
    .text(`N°: ${invoice.invoiceNumber}`, 400, 78, { align: "right" })
    .text(`Date: ${fmt(invoice.createdAt)}`, 400, 93, { align: "right" });

  const statusLabel = invoice.paymentStatus === "paid" ? "PAYÉE"
    : invoice.paymentStatus === "partial" ? "PARTIELLE" : "NON PAYÉE";
  const statusColor = invoice.paymentStatus === "paid" ? "#16a34a"
    : invoice.paymentStatus === "partial" ? "#d97706" : "#dc2626";
  doc.fillColor(statusColor).fontSize(10).font("Helvetica-Bold")
    .text(statusLabel, 400, 108, { align: "right" });

  // Client
  doc.fillColor("#111").moveTo(50, 160).lineTo(550, 160).stroke("#e5e7eb");
  doc.fontSize(10).font("Helvetica-Bold").fillColor("#374151").text("FACTURER À:", 50, 170);
  const c = invoice.customer;
  doc.font("Helvetica").fillColor("#111")
    .text(c.fullName || "-", 50, 185)
    .text(c.phone || "", 50, 198)
    .text(c.email || "", 50, 211)
    .text(c.address || "", 50, 224);

  // Table header
  const tableTop = 260;
  doc.rect(50, tableTop, 500, 22).fill("#1e40af");
  doc.fillColor("#fff").fontSize(9).font("Helvetica-Bold")
    .text("Produit", 55, tableTop + 7)
    .text("Qté", 330, tableTop + 7, { width: 60, align: "center" })
    .text("Prix unit.", 390, tableTop + 7, { width: 80, align: "right" })
    .text("Total", 470, tableTop + 7, { width: 75, align: "right" });

  // Table rows
  let y = tableTop + 22;
  invoice.items.forEach((item, i) => {
    if (i % 2 === 1) doc.rect(50, y, 500, 20).fill("#f9fafb");
    doc.fillColor("#111").font("Helvetica").fontSize(9)
      .text(item.productName, 55, y + 6)
      .text(String(item.quantity), 330, y + 6, { width: 60, align: "center" })
      .text(formatCFA(item.unitPrice), 390, y + 6, { width: 80, align: "right" })
      .text(formatCFA(item.total), 470, y + 6, { width: 75, align: "right" });
    y += 20;
  });

  doc.moveTo(50, y + 5).lineTo(550, y + 5).stroke("#e5e7eb");
  y += 15;

  // Totals
  const totals = [
    ["Sous-total", formatCFA(invoice.subtotal)],
    ["Réduction", formatCFA(invoice.discount)],
    ["TOTAL", formatCFA(invoice.totalAmount), true],
    ["Montant payé", formatCFA(invoice.amountPaid)],
    ["Reste à payer", formatCFA(invoice.remainingAmount)],
  ];
  totals.forEach(([label, value, bold]) => {
    doc.font(bold ? "Helvetica-Bold" : "Helvetica")
      .fillColor(bold ? "#1e40af" : "#111")
      .fontSize(bold ? 11 : 9)
      .text(label, 350, y, { width: 130, align: "right" })
      .text(value, 480, y, { width: 65, align: "right" });
    y += bold ? 16 : 14;
  });

  // Footer
  if (settings.invoiceFooter) {
    doc.moveTo(50, 770).lineTo(550, 770).stroke("#e5e7eb");
    doc.fontSize(9).font("Helvetica").fillColor("#6b7280")
      .text(settings.invoiceFooter, 50, 778, { align: "center", width: 500 });
  }

  doc.end();
};
