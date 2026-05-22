import Customer from "../models/Customer.js";
import Invoice from "../models/Invoice.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const escapeRegex = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

export const getCustomers = asyncHandler(async (req, res) => {
  const { search, page = "1", limit = "50" } = req.query;
  const filter = search
    ? (() => { const safe = escapeRegex(search.slice(0, 100)); return { $or: [{ fullName: { $regex: safe, $options: "i" } }, { phone: { $regex: safe, $options: "i" } }] }; })()
    : {};
  const skip = (Math.max(1, parseInt(page)) - 1) * Math.min(100, parseInt(limit));
  const take = Math.min(100, parseInt(limit));
  const [customers, total] = await Promise.all([
    Customer.find(filter).sort({ createdAt: -1 }).skip(skip).limit(take),
    Customer.countDocuments(filter),
  ]);
  res.json({ success: true, data: customers, pagination: { total, page: parseInt(page), limit: take } });
});

export const getCustomer = asyncHandler(async (req, res) => {
  const customer = await Customer.findById(req.params.id);
  if (!customer) { res.status(404); throw new Error("Client non trouvé"); }
  res.json({ success: true, data: customer });
});

export const createCustomer = asyncHandler(async (req, res) => {
  const { fullName, phone, email, address, type, notes } = req.body;
  if (!fullName) { res.status(400); throw new Error("Le nom complet est requis"); }
  const customer = await Customer.create({ fullName, phone, email, address, type, notes });
  res.status(201).json({ success: true, data: customer });
});

export const updateCustomer = asyncHandler(async (req, res) => {
  const customer = await Customer.findById(req.params.id);
  if (!customer) { res.status(404); throw new Error("Client non trouvé"); }
  const { fullName, phone, email, address, type, notes } = req.body;
  if (fullName !== undefined) customer.fullName = fullName;
  if (phone !== undefined) customer.phone = phone;
  if (email !== undefined) customer.email = email;
  if (address !== undefined) customer.address = address;
  if (type !== undefined) customer.type = type;
  if (notes !== undefined) customer.notes = notes;
  await customer.save();
  res.json({ success: true, data: customer });
});

export const deleteCustomer = asyncHandler(async (req, res) => {
  const customer = await Customer.findById(req.params.id);
  if (!customer) { res.status(404); throw new Error("Client non trouvé"); }
  const invoiceCount = await Invoice.countDocuments({ customer: req.params.id });
  if (invoiceCount > 0) {
    res.status(409);
    throw new Error(`Impossible de supprimer ce client : ${invoiceCount} facture(s) lui sont associées`);
  }
  await customer.deleteOne();
  res.json({ success: true, message: "Client supprimé" });
});

export const getCustomerInvoices = asyncHandler(async (req, res) => {
  const { page = "1", limit = "50" } = req.query;
  const skip = (Math.max(1, parseInt(page)) - 1) * Math.min(100, parseInt(limit));
  const take = Math.min(100, parseInt(limit));
  const [invoices, total] = await Promise.all([
    Invoice.find({ customer: req.params.id }).sort({ createdAt: -1 }).skip(skip).limit(take),
    Invoice.countDocuments({ customer: req.params.id }),
  ]);
  res.json({ success: true, data: invoices, pagination: { total, page: parseInt(page), limit: take } });
});
