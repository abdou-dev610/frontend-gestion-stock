import { Router } from "express";
import { getProducts, getProduct, createProduct, updateProduct, deleteProduct } from "../controllers/productController.js";
import { protect } from "../middlewares/authMiddleware.js";
import { validate } from "../middlewares/validateMiddleware.js";
import { validateProduct, validateProductUpdate } from "../middlewares/validators.js";
import { validateObjectId } from "../middlewares/validateObjectId.js";

const router = Router();
router.use(protect);
router.route("/").get(getProducts).post(validateProduct, validate, createProduct);
router.route("/:id").all(validateObjectId).get(getProduct).put(validateProductUpdate, validate, updateProduct).delete(deleteProduct);
export default router;
