import { Router } from "express";
import { login, getMe, registerAdmin, logout } from "../controllers/authController.js";
import { protect } from "../middlewares/authMiddleware.js";

const router = Router();
router.post("/login", login);
router.post("/register-admin", registerAdmin);
router.get("/me", protect, getMe);
router.post("/logout", protect, logout);
export default router;
