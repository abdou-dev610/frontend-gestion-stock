import mongoose from "mongoose";

const settingsSchema = new mongoose.Schema({
  companyName: { type: String, default: "StockFact Pro" },
  logo: { type: String, default: "" },
  phone: { type: String, default: "" },
  email: { type: String, default: "" },
  address: { type: String, default: "" },
  ninea: { type: String, default: "" },
  rccm: { type: String, default: "" },
  invoiceFooter: { type: String, default: "Merci pour votre confiance !" },
}, { timestamps: true });

export default mongoose.model("Settings", settingsSchema);
