import mongoose from "mongoose";
import Invoice from "../models/Invoice.js";
import Product from "../models/Product.js";
import Customer from "../models/Customer.js";
import StockMovement from "../models/StockMovement.js";
import Settings from "../models/Settings.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { generateInvoiceNumber } from "../utils/generateInvoiceNumber.js";
import { generateInvoicePdf } from "../utils/generateInvoicePdf.js";

export const getInvoices = asyncHandler(async (req, res) => {
  const { search, status, page = "1", limit = "50" } = req.query;
  const filter = {};
  if (status) filter.paymentStatus = status;
  if (search) {
    const safe = search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&").slice(0, 100);
    const matchingCustomers = await Customer.find(
      { fullName: { $regex: safe, $options: "i" } },
      { _id: 1 }
    ).lean();
    const customerIds = matchingCustomers.map(c => c._id);
    filter.$or = [
      { invoiceNumber: { $regex: safe, $options: "i" } },
      ...(customerIds.length ? [{ customer: { $in: customerIds } }] : []),
    ];
  }
  const skip = (Math.max(1, parseInt(page)) - 1) * Math.min(100, parseInt(limit));
  const take = Math.min(100, parseInt(limit));
  const [invoices, total] = await Promise.all([
    Invoice.find(filter)
      .populate("customer", "fullName phone email")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(take),
    Invoice.countDocuments(filter),
  ]);
  res.json({ success: true, data: invoices, pagination: { total, page: parseInt(page), limit: take } });
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

  if (!mongoose.isValidObjectId(customerId)) {
    res.status(400);
    throw new Error("Identifiant client invalide");
  }
  const customerExists = await Customer.exists({ _id: customerId });
  if (!customerExists) {
    res.status(404);
    throw new Error("Client introuvable");
  }

  const productIds = items.map(i => i.productId);
  if (new Set(productIds).size !== productIds.length) {
    res.status(400);
    throw new Error("Doublons détectés : plusieurs lignes utilisent le même produit");
  }

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // Vérifier le stock et préparer les lignes
    const invoiceItems = [];
    for (const item of items) {
      const product = await Product.findById(item.productId).session(session);
      if (!product) throw new Error(`Produit introuvable: ${item.productId}`);
      if (product.quantity < item.quantity) {
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
    const [invoice] = await Invoice.create([{
      invoiceNumber,
      customer: customerId,
      items: invoiceItems,
      discount,
      amountPaid,
      paymentMethod,
      notes,
      createdBy: req.user._id,
    }], { session });

    // Diminuer le stock et créer les mouvements
    for (const item of invoiceItems) {
      const product = await Product.findById(item.product).session(session);
      const previousQuantity = product.quantity;
      product.quantity -= item.quantity;
      await product.save({ session });
      await StockMovement.create([{
        product: item.product,
        type: "sale",
        quantity: item.quantity,
        previousQuantity,
        newQuantity: product.quantity,
        reason: `Facture ${invoiceNumber}`,
        createdBy: req.user._id,
      }], { session });
    }

    await session.commitTransaction();

    const populated = await Invoice.findById(invoice._id)
      .populate("customer", "fullName phone email address");
    res.status(201).json({ success: true, data: populated });

  } catch (err) {
    await session.abortTransaction();
    res.status(400);
    throw err;
  } finally {
    session.endSession();
  }
});

export const updateInvoice = asyncHandler(async (req, res) => {
  const invoice = await Invoice.findById(req.params.id);
  if (!invoice) { res.status(404); throw new Error("Facture non trouvée"); }
  const { amountPaid, paymentMethod, notes, discount } = req.body;

  const newDiscount = discount !== undefined ? discount : invoice.discount;
  const newSubtotal = invoice.subtotal;
  if (newDiscount > newSubtotal) {
    res.status(400);
    throw new Error(`La remise (${newDiscount}) ne peut pas dépasser le sous-total (${newSubtotal})`);
  }

  const newTotal = newSubtotal - newDiscount;
  const newAmountPaid = amountPaid !== undefined ? amountPaid : invoice.amountPaid;
  if (newAmountPaid > newTotal) {
    res.status(400);
    throw new Error(`Le montant payé (${newAmountPaid}) ne peut pas dépasser le total (${newTotal})`);
  }

  if (amountPaid !== undefined) invoice.amountPaid = amountPaid;
  if (paymentMethod) invoice.paymentMethod = paymentMethod;
  if (notes !== undefined) invoice.notes = notes;
  if (discount !== undefined) invoice.discount = discount;
  await invoice.save();
  const populated = await Invoice.findById(invoice._id)
    .populate("customer", "fullName phone email address");
  res.json({ success: true, data: populated });
});

export const deleteInvoice = asyncHandler(async (req, res) => {
  const invoice = await Invoice.findById(req.params.id).populate("items.product");
  if (!invoice) { res.status(404); throw new Error("Facture non trouvée"); }

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // Restaurer le stock pour chaque article
    for (const item of invoice.items) {
      const product = await Product.findById(item.product).session(session);
      if (product) {
        const previousQuantity = product.quantity;
        product.quantity += item.quantity;
        await product.save({ session });
        await StockMovement.create([{
          product: item.product,
          type: "in",
          quantity: item.quantity,
          previousQuantity,
          newQuantity: product.quantity,
          reason: `Annulation facture ${invoice.invoiceNumber}`,
          createdBy: req.user._id,
        }], { session });
      }
    }

    await Invoice.findByIdAndDelete(req.params.id).session(session);
    await session.commitTransaction();
    res.json({ success: true, message: "Facture supprimée et stock restauré" });

  } catch (err) {
    await session.abortTransaction();
    res.status(500);
    throw err;
  } finally {
    session.endSession();
  }
});

export const downloadInvoicePdf = asyncHandler(async (req, res) => {
  const invoice = await Invoice.findById(req.params.id)
    .populate("customer", "fullName phone email address")
    .populate("createdBy", "name");
  if (!invoice) { res.status(404); throw new Error("Facture non trouvée"); }
  let settings = await Settings.findOne();
  if (!settings) settings = new Settings();
  generateInvoicePdf(invoice, settings, res);
});
