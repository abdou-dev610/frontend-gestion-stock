import Product from "../models/Product.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const getProducts = asyncHandler(async (req, res) => {
  const { search, category, status } = req.query;
  const filter = {};
  if (search) filter.$or = [
    { name: { $regex: search, $options: "i" } },
    { reference: { $regex: search, $options: "i" } },
  ];
  if (category) filter.category = category;
  if (status) filter.status = status;
  const products = await Product.find(filter).sort({ createdAt: -1 });
  res.json({ success: true, data: products });
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
  Object.assign(product, req.body);
  await product.save();
  res.json({ success: true, data: product });
});

export const deleteProduct = asyncHandler(async (req, res) => {
  const product = await Product.findByIdAndDelete(req.params.id);
  if (!product) { res.status(404); throw new Error("Produit non trouvé"); }
  res.json({ success: true, message: "Produit supprimé" });
});
