import { Router } from "express";
import { getCustomers, getCustomer, createCustomer, updateCustomer, deleteCustomer, getCustomerInvoices } from "../controllers/customerController.js";
import { protect } from "../middlewares/authMiddleware.js";

const router = Router();
router.use(protect);
router.route("/").get(getCustomers).post(createCustomer);
router.route("/:id").get(getCustomer).put(updateCustomer).delete(deleteCustomer);
router.get("/:id/invoices", getCustomerInvoices);
export default router;
