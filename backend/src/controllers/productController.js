import Product from "../models/Product.js";
import Invoice from "../models/Invoice.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const escapeRegex = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

export const getProducts = asyncHandler(async (req, res) => {
  const { search, category, status, page = "1", limit = "50" } = req.query;
  const filter = {};
  if (search) {
    const safe = escapeRegex(search.slice(0, 100));
    filter.$or = [
      { name: { $regex: safe, $options: "i" } },
      { reference: { $regex: safe, $options: "i" } },
    ];
  }
  if (category) filter.category = category;
  if (status) filter.status = status;
  const skip = (Math.max(1, parseInt(page)) - 1) * Math.min(100, parseInt(limit));
  const take = Math.min(100, parseInt(limit));
  const [products, total] = await Promise.all([
    Product.find(filter).sort({ createdAt: -1 }).skip(skip).limit(take),
    Product.countDocuments(filter),
  ]);
  res.json({ success: true, data: products, pagination: { total, page: parseInt(page), limit: take } });
});

export const getProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) { res.status(404); throw new Error("Produit non trouvé"); }
  res.json({ success: true, data: product });
});

export const createProduct = asyncHandler(async (req, res) => {
  const { name, reference, category, description, purchasePrice, salePrice, quantity, alertThreshold, image } = req.body;
  const exists = await Product.findOne({ reference: reference?.toUpperCase() });
  if (exists) { res.status(400); throw new Error("Cette référence existe déjà"); }
  const product = await Product.create({ name, reference, category, description, purchasePrice, salePrice, quantity, alertThreshold, image });
  res.status(201).json({ success: true, data: product });
});

export const updateProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) { res.status(404); throw new Error("Produit non trouvé"); }
  const { name, reference, category, description, purchasePrice, salePrice, quantity, alertThreshold, image, status } = req.body;
  if (reference !== undefined) {
    const upperRef = reference.toUpperCase();
    const conflict = await Product.findOne({ reference: upperRef, _id: { $ne: product._id } });
    if (conflict) { res.status(409); throw new Error("Cette référence est déjà utilisée par un autre produit"); }
    product.reference = upperRef;
  }
  if (name !== undefined) product.name = name;
  if (category !== undefined) product.category = category;
  if (description !== undefined) product.description = description;
  if (purchasePrice !== undefined) product.purchasePrice = purchasePrice;
  if (salePrice !== undefined) product.salePrice = salePrice;
  if (quantity !== undefined) product.quantity = quantity;
  if (alertThreshold !== undefined) product.alertThreshold = alertThreshold;
  if (image !== undefined) product.image = image;
  if (status !== undefined) product.status = status;
  await product.save();
  res.json({ success: true, data: product });
});

export const deleteProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) { res.status(404); throw new Error("Produit non trouvé"); }
  const invoiceCount = await Invoice.countDocuments({ "items.product": req.params.id });
  if (invoiceCount > 0) {
    res.status(409);
    throw new Error(`Impossible de supprimer ce produit : présent dans ${invoiceCount} facture(s)`);
  }
  await product.deleteOne();
  res.json({ success: true, message: "Produit supprimé" });
});
