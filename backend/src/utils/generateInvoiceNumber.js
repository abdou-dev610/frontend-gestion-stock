import Invoice from "../models/Invoice.js";

export const generateInvoiceNumber = async () => {
  const year = new Date().getFullYear();
  const prefix = `FAC-${year}-`;
  const last = await Invoice.findOne(
    { invoiceNumber: { $regex: `^${prefix}` } },
    { invoiceNumber: 1 },
    { sort: { invoiceNumber: -1 } }
  );
  if (!last) return `${prefix}0001`;
  const num = parseInt(last.invoiceNumber.split("-").pop(), 10) + 1;
  return `${prefix}${String(num).padStart(4, "0")}`;
};
