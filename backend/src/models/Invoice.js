import mongoose from "mongoose";

const invoiceItemSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
  productName: { type: String, required: true },
  quantity: { type: Number, required: true, min: 1 },
  unitPrice: { type: Number, required: true, min: 0 },
  total: { type: Number, required: true },
}, { _id: false });

const invoiceSchema = new mongoose.Schema({
  invoiceNumber: { type: String, required: true, unique: true },
  customer: { type: mongoose.Schema.Types.ObjectId, ref: "Customer", required: true },
  items: [invoiceItemSchema],
  subtotal: { type: Number, required: true, default: 0 },
  discount: { type: Number, default: 0 },
  totalAmount: { type: Number, required: true, default: 0 },
  amountPaid: { type: Number, default: 0 },
  remainingAmount: { type: Number, default: 0 },
  paymentStatus: {
    type: String,
    enum: ["paid", "partial", "unpaid"],
    default: "unpaid",
  },
  paymentMethod: {
    type: String,
    enum: ["cash", "wave", "orange_money", "bank_transfer", "other"],
    default: "cash",
  },
  notes: { type: String, default: "" },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
}, { timestamps: true });

invoiceSchema.pre("save", function (next) {
  this.subtotal = this.items.reduce((s, i) => s + i.total, 0);
  this.totalAmount = this.subtotal - this.discount;
  this.remainingAmount = this.totalAmount - this.amountPaid;
  if (this.remainingAmount <= 0) this.paymentStatus = "paid";
  else if (this.amountPaid > 0) this.paymentStatus = "partial";
  else this.paymentStatus = "unpaid";
  next();
});

export default mongoose.model("Invoice", invoiceSchema);
