import Customer from "../models/Customer.js";
import Invoice from "../models/Invoice.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const getCustomers = asyncHandler(async (req, res) => {
  const { search } = req.query;
  const filter = search
    ? { $or: [{ fullName: { $regex: search, $options: "i" } }, { phone: { $regex: search, $options: "i" } }] }
    : {};
  const customers = await Customer.find(filter).sort({ createdAt: -1 });
  res.json({ success: true, data: customers });
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
  Object.assign(customer, req.body);
  await customer.save();
  res.json({ success: true, data: customer });
});

export const deleteCustomer = asyncHandler(async (req, res) => {
  const customer = await Customer.findByIdAndDelete(req.params.id);
  if (!customer) { res.status(404); throw new Error("Client non trouvé"); }
  res.json({ success: true, message: "Client supprimé" });
});

export const getCustomerInvoices = asyncHandler(async (req, res) => {
  const invoices = await Invoice.find({ customer: req.params.id })
    .sort({ createdAt: -1 });
  res.json({ success: true, data: invoices });
});
