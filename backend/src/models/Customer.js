import mongoose from "mongoose";

const customerSchema = new mongoose.Schema({
  fullName: { type: String, required: true, trim: true },
  phone: { type: String, default: "" },
  email: { type: String, default: "", lowercase: true, trim: true },
  address: { type: String, default: "" },
  type: { type: String, enum: ["particulier", "entreprise", "grossiste"], default: "particulier" },
  notes: { type: String, default: "", maxlength: 1000 },
}, { timestamps: true });

customerSchema.index({ fullName: 1 });

export default mongoose.model("Customer", customerSchema);
