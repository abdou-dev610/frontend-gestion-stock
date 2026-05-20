import Invoice from "../models/Invoice.js";
import Product from "../models/Product.js";
import StockMovement from "../models/StockMovement.js";
import Settings from "../models/Settings.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { generateInvoiceNumber } from "../utils/generateInvoiceNumber.js";
import { generateInvoicePdf } from "../utils/generateInvoicePdf.js";

export const getInvoices = asyncHandler(async (req, res) => {
  const { search, status } = req.query;
  const filter = {};
  if (status) filter.paymentStatus = status;
  let invoices = await Invoice.find(filter)
    .populate("customer", "fullName phone email")
    .sort({ createdAt: -1 });
  if (search) {
    invoices = invoices.filter(i =>
      i.invoiceNumber.toLowerCase().includes(search.toLowerCase()) ||
      i.customer?.fullName?.toLowerCase().includes(search.toLowerCase())
    );
  }
  res.json({ success: true, data: invoices });
});

export const getInvoice = asyncHandler(async (req, res) => {
  const invoice = await Invoice.findById(req.params.id)
    .populate("customer", "fullName phone email address")
    .populate("createdBy", "name");
  if (!invoice) { res.status(404); throw new Error("Facture non trouvée"); }
  res.json({ success: true, data: invoice });
});

export const createInvoice = asyncHandler(async (req, res) => {
  const { customerId, items, discount = 0, amountPaid = 0, paymentMethod = "cash", notes } = req.body;
  if (!customerId || !items?.length) {
    res.status(400);
    throw new Error("Client et articles requis");
  }

  // Vérifier le stock et préparer les lignes
  const invoiceItems = [];
  for (const item of items) {
    const product = await Product.findById(item.productId);
    if (!product) { res.status(404); throw new Error(`Produit introuvable: ${item.productId}`); }
    if (product.quantity < item.quantity) {
      res.status(400);
      throw new Error(`Stock insuffisant pour "${product.name}". Disponible: ${product.quantity}, demandé: ${item.quantity}`);
    }
    invoiceItems.push({
      product: product._id,
      productName: product.name,
      quantity: item.quantity,
      unitPrice: item.unitPrice || product.salePrice,
      total: (item.unitPrice || product.salePrice) * item.quantity,
    });
  }

  const invoiceNumber = await generateInvoiceNumber();
  const invoice = await Invoice.create({
    invoiceNumber,
    customer: customerId,
    items: invoiceItems,
    discount,
    amountPaid,
    paymentMethod,
    notes,
    createdBy: req.user._id,
  });

  // Diminuer le stock et créer les mouvements
  for (const item of invoiceItems) {
    const product = await Product.findById(item.product);
    const previousQuantity = product.quantity;
    product.quantity -= item.quantity;
    await product.save();
    await StockMovement.create({
      product: item.product,
      type: "sale",
      quantity: item.quantity,
      previousQuantity,
      newQuantity: product.quantity,
      reason: `Facture ${invoiceNumber}`,
      createdBy: req.user._id,
    });
  }

  const populated = await Invoice.findById(invoice._id).populate("customer", "fullName phone email address");
  res.status(201).json({ success: true, data: populated });
});

export const updateInvoice = asyncHandler(async (req, res) => {
  const invoice = await Invoice.findById(req.params.id);
  if (!invoice) { res.status(404); throw new Error("Facture non trouvée"); }
  const { amountPaid, paymentMethod, notes, discount } = req.body;
  if (amountPaid !== undefined) invoice.amountPaid = amountPaid;
  if (paymentMethod) invoice.paymentMethod = paymentMethod;
  if (notes !== undefined) invoice.notes = notes;
  if (discount !== undefined) invoice.discount = discount;
  await invoice.save();
  const populated = await Invoice.findById(invoice._id).populate("customer", "fullName phone email address");
  res.json({ success: true, data: populated });
});

export const deleteInvoice = asyncHandler(async (req, res) => {
  const invoice = await Invoice.findByIdAndDelete(req.params.id);
  if (!invoice) { res.status(404); throw new Error("Facture non trouvée"); }
  res.json({ success: true, message: "Facture supprimée" });
});

export const downloadInvoicePdf = asyncHandler(async (req, res) => {
  const invoice = await Invoice.findById(req.params.id)
    .populate("customer", "fullName phone email address")
    .populate("createdBy", "name");
  if (!invoice) { res.status(404); throw new Error("Facture non trouvée"); }
  let settings = await Settings.findOne();
  if (!settings) settings = {};
  generateInvoicePdf(invoice, settings, res);
});
