import mongoose from "mongoose";
import Product from "../models/Product.js";
import StockMovement from "../models/StockMovement.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const getStock = asyncHandler(async (req, res) => {
  const products = await Product.find({ status: "active" }).sort({ name: 1 });
  res.json({ success: true, data: products });
});

export const getLowStock = asyncHandler(async (req, res) => {
  const products = await Product.find({
    $expr: { $lte: ["$quantity", "$alertThreshold"] },
    status: "active",
  }).sort({ quantity: 1 });
  res.json({ success: true, data: products });
});

export const createMovement = asyncHandler(async (req, res) => {
  const { productId, type, quantity, reason } = req.body;
  if (!productId || !type || !quantity) {
    res.status(400);
    throw new Error("productId, type et quantity sont requis");
  }
  if (!mongoose.isValidObjectId(productId)) {
    res.status(400);
    throw new Error("Identifiant produit invalide");
  }

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const product = await Product.findById(productId).session(session);
    if (!product) { res.status(404); throw new Error("Produit non trouvé"); }

    const previousQuantity = product.quantity;
    let newQuantity;

    if (type === "in") {
      newQuantity = previousQuantity + Number(quantity);
    } else if (type === "out" || type === "sale") {
      if (previousQuantity < Number(quantity)) {
        res.status(400);
        throw new Error(`Stock insuffisant. Stock actuel: ${previousQuantity}`);
      }
      newQuantity = previousQuantity - Number(quantity);
    } else if (type === "adjustment") {
      newQuantity = Number(quantity);
    } else {
      res.status(400);
      throw new Error("Type de mouvement invalide");
    }

    product.quantity = newQuantity;
    await product.save({ session });

    const [movement] = await StockMovement.create([{
      product: productId,
      type,
      quantity: Number(quantity),
      previousQuantity,
      newQuantity,
      reason: reason || "",
      createdBy: req.user._id,
    }], { session });

    await session.commitTransaction();
    res.status(201).json({ success: true, data: { movement, product } });

  } catch (err) {
    await session.abortTransaction();
    res.status(res.statusCode === 200 ? 400 : res.statusCode);
    throw err;
  } finally {
    session.endSession();
  }
});

export const getMovements = asyncHandler(async (req, res) => {
  const { productId, page = "1", limit = "50" } = req.query;
  const filter = productId ? { product: productId } : {};
  const take = Math.min(100, parseInt(limit));
  const skip = (Math.max(1, parseInt(page)) - 1) * take;
  const [movements, total] = await Promise.all([
    StockMovement.find(filter)
      .populate("product", "name reference")
      .populate("createdBy", "name")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(take),
    StockMovement.countDocuments(filter),
  ]);
  res.json({ success: true, data: movements, pagination: { total, page: parseInt(page), limit: take } });
});
