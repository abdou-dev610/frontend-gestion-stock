import Counter from "../models/Counter.js";

export const generateInvoiceNumber = async () => {
  const year = new Date().getFullYear();
  const counter = await Counter.findOneAndUpdate(
    { _id: `invoice-${year}` },
    { $inc: { seq: 1 } },
    { upsert: true, new: true }
  );
  return `FAC-${year}-${String(counter.seq).padStart(6, "0")}`;
};
