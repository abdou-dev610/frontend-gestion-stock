import { Router } from "express";
import { getSettings, updateSettings } from "../controllers/settingsController.js";
import { protect } from "../middlewares/authMiddleware.js";

const router = Router();
router.use(protect);
router.route("/").get(getSettings).put(updateSettings);
export default router;
