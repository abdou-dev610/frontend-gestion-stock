import Product from "../models/Product.js";
import Customer from "../models/Customer.js";
import Invoice from "../models/Invoice.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const getStats = asyncHandler(async (req, res) => {
  const [totalProducts, totalCustomers, totalInvoices, invoices, lowStockProducts] = await Promise.all([
    Product.countDocuments({ status: "active" }),
    Customer.countDocuments(),
    Invoice.countDocuments(),
    Invoice.find({ paymentStatus: "paid" }, { totalAmount: 1 }),
    Product.countDocuments({ $expr: { $lte: ["$quantity", "$alertThreshold"] }, status: "active" }),
  ]);
  const revenue = invoices.reduce((s, i) => s + i.totalAmount, 0);
  res.json({ success: true, data: { totalProducts, totalCustomers, totalInvoices, revenue, lowStock: lowStockProducts } });
});

export const getRecentInvoices = asyncHandler(async (req, res) => {
  const invoices = await Invoice.find()
    .populate("customer", "fullName")
    .sort({ createdAt: -1 })
    .limit(10);
  res.json({ success: true, data: invoices });
});

export const getLowStock = asyncHandler(async (req, res) => {
  const products = await Product.find({
    $expr: { $lte: ["$quantity", "$alertThreshold"] },
    status: "active",
  }).sort({ quantity: 1 }).limit(10);
  res.json({ success: true, data: products });
});

export const getSalesChart = asyncHandler(async (req, res) => {
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
  sixMonthsAgo.setDate(1);
  sixMonthsAgo.setHours(0, 0, 0, 0);

  const data = await Invoice.aggregate([
    { $match: { createdAt: { $gte: sixMonthsAgo }, paymentStatus: { $in: ["paid", "partial"] } } },
    { $group: {
      _id: { year: { $year: "$createdAt" }, month: { $month: "$createdAt" } },
      value: { $sum: "$totalAmount" },
    }},
    { $sort: { "_id.year": 1, "_id.month": 1 } },
  ]);

  const months = ["Jan", "Fév", "Mar", "Avr", "Mai", "Juin", "Juil", "Août", "Sep", "Oct", "Nov", "Déc"];
  const result = data.map(d => ({
    month: months[d._id.month - 1],
    value: d.value,
  }));

  res.json({ success: true, data: result });
});
