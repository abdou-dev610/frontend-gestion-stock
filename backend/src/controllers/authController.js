import User from "../models/User.js";
import { generateToken } from "../utils/generateToken.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    res.status(400);
    throw new Error("Email et mot de passe requis");
  }
  const user = await User.findOne({ email });
  if (!user || !(await user.matchPassword(password))) {
    res.status(401);
    throw new Error("Identifiants incorrects");
  }
  if (!user.isActive) {
    res.status(401);
    throw new Error("Compte désactivé");
  }
  res.json({
    success: true,
    token: generateToken(user._id),
    user: { id: user._id, name: user.name, email: user.email, role: user.role },
  });
});

export const getMe = asyncHandler(async (req, res) => {
  res.json({ success: true, user: req.user });
});

export const registerAdmin = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;
  const exists = await User.findOne({ email });
  if (exists) {
    res.status(400);
    throw new Error("Cet email est déjà utilisé");
  }
  const user = await User.create({ name, email, password, role: "admin" });
  res.status(201).json({
    success: true,
    token: generateToken(user._id),
    user: { id: user._id, name: user.name, email: user.email, role: user.role },
  });
});

export const logout = asyncHandler(async (req, res) => {
  await req.user.updateOne({ lastLogout: new Date() });
  res.json({ success: true, message: "Déconnexion réussie" });
});
