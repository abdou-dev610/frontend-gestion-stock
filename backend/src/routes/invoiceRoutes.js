import { Router } from "express";
import { getInvoices, getInvoice, createInvoice, updateInvoice, deleteInvoice, downloadInvoicePdf } from "../controllers/invoiceController.js";
import { protect } from "../middlewares/authMiddleware.js";

const router = Router();
router.use(protect);
router.route("/").get(getInvoices).post(createInvoice);
router.route("/:id").get(getInvoice).put(updateInvoice).delete(deleteInvoice);
router.get("/:id/pdf", downloadInvoicePdf);
export default router;
