import { Router } from "express";
import { getProducts, getProduct, createProduct, updateProduct, deleteProduct } from "../controllers/productController.js";
import { protect } from "../middlewares/authMiddleware.js";

const router = Router();
router.use(protect);
router.route("/").get(getProducts).post(createProduct);
router.route("/:id").get(getProduct).put(updateProduct).delete(deleteProduct);
export default router;
