import { Router } from "express";
import rateLimit from "express-rate-limit";
import { login, getMe, registerAdmin, logout } from "../controllers/authController.js";
import { protect, adminOnly } from "../middlewares/authMiddleware.js";

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { success: false, message: "Trop de tentatives. Réessayez dans 15 minutes." },
  standardHeaders: true,
  legacyHeaders: false,
});

const router = Router();
router.post("/login", loginLimiter, login);
router.post("/register-admin", protect, adminOnly, registerAdmin);
router.get("/me", protect, getMe);
router.post("/logout", protect, logout);
export default router;
