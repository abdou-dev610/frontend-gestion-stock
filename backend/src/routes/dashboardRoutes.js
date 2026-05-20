import { Router } from "express";
import { getStats, getRecentInvoices, getLowStock, getSalesChart } from "../controllers/dashboardController.js";
import { protect } from "../middlewares/authMiddleware.js";

const router = Router();
router.use(protect);
router.get("/stats", getStats);
router.get("/recent-invoices", getRecentInvoices);
router.get("/low-stock", getLowStock);
router.get("/sales-chart", getSalesChart);
export default router;
