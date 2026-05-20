import mongoose from "mongoose";

const productSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  reference: { type: String, required: true, unique: true, uppercase: true, trim: true },
  category: { type: String, required: true, trim: true },
  description: { type: String, default: "" },
  purchasePrice: { type: Number, required: true, min: 0 },
  salePrice: { type: Number, required: true, min: 0 },
  quantity: { type: Number, required: true, min: 0, default: 0 },
  alertThreshold: { type: Number, default: 10, min: 0 },
  image: { type: String, default: "" },
  status: { type: String, enum: ["active", "inactive"], default: "active" },
}, { timestamps: true });

productSchema.virtual("stockStatus").get(function () {
  if (this.quantity === 0) return "Rupture";
  if (this.quantity <= this.alertThreshold) return "Stock faible";
  return "En stock";
});

productSchema.set("toJSON", { virtuals: true });
productSchema.set("toObject", { virtuals: true });

export default mongoose.model("Product", productSchema);
