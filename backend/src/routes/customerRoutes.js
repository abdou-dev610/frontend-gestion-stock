import { Router } from "express";
import { getCustomers, getCustomer, createCustomer, updateCustomer, deleteCustomer, getCustomerInvoices } from "../controllers/customerController.js";
import { protect } from "../middlewares/authMiddleware.js";
import { validate } from "../middlewares/validateMiddleware.js";
import { validateCustomer, validateCustomerUpdate } from "../middlewares/validators.js";
import { validateObjectId } from "../middlewares/validateObjectId.js";

const router = Router();
router.use(protect);
router.route("/").get(getCustomers).post(validateCustomer, validate, createCustomer);
router.route("/:id").all(validateObjectId).get(getCustomer).put(validateCustomerUpdate, validate, updateCustomer).delete(deleteCustomer);
router.get("/:id/invoices", validateObjectId, getCustomerInvoices);
export default router;
