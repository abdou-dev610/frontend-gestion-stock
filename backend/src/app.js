import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import dotenv from "dotenv";

import authRoutes from "./routes/authRoutes.js";
import dashboardRoutes from "./routes/dashboardRoutes.js";
import productRoutes from "./routes/productRoutes.js";
import stockRoutes from "./routes/stockRoutes.js";
import customerRoutes from "./routes/customerRoutes.js";
import invoiceRoutes from "./routes/invoiceRoutes.js";
import settingsRoutes from "./routes/settingsRoutes.js";
import { notFoundMiddleware } from "./middlewares/notFoundMiddleware.js";
import { errorMiddleware } from "./middlewares/errorMiddleware.js";

dotenv.config();

const app = express();

if (process.env.NODE_ENV === "production" && !process.env.ALLOWED_ORIGINS) {
  console.warn("⚠️  ALLOWED_ORIGINS non défini — CORS limité à http://localhost:5173 en production !");
}
const allowedOrigins = (process.env.ALLOWED_ORIGINS || "http://localhost:5173").split(",").map(o => o.trim());

const isOriginAllowed = (origin) => {
  if (!origin) return true;
  if (allowedOrigins.includes(origin)) return true;
  // Accepte tous les sous-domaines Vercel (preview + production)
  if (/^https:\/\/[a-zA-Z0-9-]+(\.vercel\.app)$/.test(origin)) return true;
  return false;
};

app.use(helmet());
app.use(cors({
  origin: (origin, callback) => {
    if (isOriginAllowed(origin)) return callback(null, true);
    callback(new Error("CORS non autorisé"));
  },
  credentials: true,
}));
app.use(morgan(process.env.NODE_ENV === "production" ? "combined" : "dev"));
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res) => res.json({ message: "StockFact Pro API", version: "1.0.0", status: "OK" }));
app.get("/api/health", (req, res) => res.json({ status: "OK", timestamp: new Date().toISOString() }));

app.use("/api/auth", authRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/products", productRoutes);
app.use("/api/stock", stockRoutes);
app.use("/api/customers", customerRoutes);
app.use("/api/invoices", invoiceRoutes);
app.use("/api/settings", settingsRoutes);

app.use(notFoundMiddleware);
app.use(errorMiddleware);

export default app;
