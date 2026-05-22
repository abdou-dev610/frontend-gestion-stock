import jwt from "jsonwebtoken";
import User from "../models/User.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const protect = asyncHandler(async (req, res, next) => {
  let token;
  if (req.headers.authorization?.startsWith("Bearer ")) {
    token = req.headers.authorization.split(" ")[1];
  }
  if (!token) {
    res.status(401);
    throw new Error("Non autorisé - token manquant");
  }
  let decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET);
  } catch {
    res.status(401);
    throw new Error("Non autorisé - token invalide");
  }
  req.user = await User.findById(decoded.id).select("-password");
  if (!req.user || !req.user.isActive) {
    res.status(401);
    throw new Error("Non autorisé - utilisateur inactif");
  }
  if (req.user.lastLogout && decoded.iat * 1000 < req.user.lastLogout.getTime()) {
    res.status(401);
    throw new Error("Non autorisé - session expirée, veuillez vous reconnecter");
  }
  next();
});

export const adminOnly = (req, res, next) => {
  if (req.user?.role !== "admin") {
    res.status(403);
    throw new Error("Accès réservé aux administrateurs");
  }
  next();
};
