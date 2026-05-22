import Product from "../models/Product.js";
import Customer from "../models/Customer.js";
import Invoice from "../models/Invoice.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const getStats = asyncHandler(async (req, res) => {
  const [totalProducts, totalCustomers, totalInvoices, revenueAgg, lowStockProducts] = await Promise.all([
    Product.countDocuments({ status: "active" }),
    Customer.countDocuments(),
    Invoice.countDocuments(),
    Invoice.aggregate([{ $match: { paymentStatus: "paid" } }, { $group: { _id: null, total: { $sum: "$totalAmount" } } }]),
    Product.countDocuments({ $expr: { $lte: ["$quantity", "$alertThreshold"] }, status: "active" }),
  ]);
  const revenue = revenueAgg[0]?.total || 0;
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
  const now = new Date();
  const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1, 0, 0, 0, 0);

  const data = await Invoice.aggregate([
    { $match: { createdAt: { $gte: sixMonthsAgo }, paymentStatus: { $in: ["paid", "partial"] } } },
    { $group: {
      _id: { year: { $year: "$createdAt" }, month: { $month: "$createdAt" } },
      value: { $sum: "$totalAmount" },
    }},
    { $sort: { "_id.year": 1, "_id.month": 1 } },
  ]);

  const monthLabels = ["Jan", "Fév", "Mar", "Avr", "Mai", "Juin", "Juil", "Août", "Sep", "Oct", "Nov", "Déc"];
  const indexed = new Map(data.map(d => [`${d._id.year}-${d._id.month}`, d.value]));

  const result = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = `${d.getFullYear()}-${d.getMonth() + 1}`;
    result.push({
      month: monthLabels[d.getMonth()],
      year: d.getFullYear(),
      value: indexed.get(key) ?? 0,
    });
  }

  res.json({ success: true, data: result });
});
