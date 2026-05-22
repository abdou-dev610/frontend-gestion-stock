import { Router } from "express";
import { getInvoices, getInvoice, createInvoice, updateInvoice, deleteInvoice, downloadInvoicePdf } from "../controllers/invoiceController.js";
import { protect } from "../middlewares/authMiddleware.js";
import { validate } from "../middlewares/validateMiddleware.js";
import { validateInvoice, validateInvoiceUpdate } from "../middlewares/validators.js";
import { validateObjectId } from "../middlewares/validateObjectId.js";

const router = Router();
router.use(protect);
router.route("/").get(getInvoices).post(validateInvoice, validate, createInvoice);
router.route("/:id").all(validateObjectId).get(getInvoice).put(validateInvoiceUpdate, validate, updateInvoice).delete(deleteInvoice);
router.get("/:id/pdf", validateObjectId, downloadInvoicePdf);
export default router;
