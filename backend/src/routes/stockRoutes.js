import { Router } from "express";
import { getStock, getLowStock, createMovement, getMovements } from "../controllers/stockController.js";
import { protect } from "../middlewares/authMiddleware.js";

const router = Router();
router.use(protect);
router.get("/", getStock);
router.get("/low", getLowStock);
router.get("/movements", getMovements);
router.post("/movement", createMovement);
export default router;
