import { body } from "express-validator";

export const validateProduct = [
  body("name").trim().notEmpty().withMessage("Le nom est requis"),
  body("reference").trim().notEmpty().withMessage("La référence est requise"),
  body("category").trim().notEmpty().withMessage("La catégorie est requise"),
  body("salePrice").isFloat({ min: 0 }).withMessage("Le prix de vente doit être un nombre positif"),
  body("purchasePrice").optional({ checkFalsy: true }).isFloat({ min: 0 }).withMessage("Le prix d'achat doit être un nombre positif"),
  body("quantity").optional({ checkFalsy: true }).isInt({ min: 0 }).withMessage("La quantité doit être un entier positif"),
  body("image").optional({ checkFalsy: true }).isURL().withMessage("L'image doit être une URL valide"),
];

export const validateProductUpdate = [
  body("name").optional().trim().notEmpty().withMessage("Le nom ne peut pas être vide"),
  body("reference").optional().trim().notEmpty().withMessage("La référence ne peut pas être vide"),
  body("category").optional().trim().notEmpty().withMessage("La catégorie ne peut pas être vide"),
  body("salePrice").optional().isFloat({ min: 0 }).withMessage("Le prix de vente doit être un nombre positif"),
  body("purchasePrice").optional({ checkFalsy: true }).isFloat({ min: 0 }).withMessage("Le prix d'achat doit être un nombre positif"),
  body("quantity").optional({ checkFalsy: true }).isInt({ min: 0 }).withMessage("La quantité doit être un entier positif"),
  body("image").optional({ checkFalsy: true }).isURL().withMessage("L'image doit être une URL valide"),
];

export const validateCustomer = [
  body("fullName").trim().notEmpty().withMessage("Le nom complet est requis"),
  body("email").optional({ checkFalsy: true }).isEmail().withMessage("Email invalide"),
  body("phone").optional({ checkFalsy: true }).trim().isLength({ min: 6 }).withMessage("Numéro de téléphone invalide"),
];

export const validateCustomerUpdate = [
  body("fullName").optional().trim().notEmpty().withMessage("Le nom ne peut pas être vide"),
  body("email").optional({ checkFalsy: true }).isEmail().withMessage("Email invalide"),
  body("phone").optional({ checkFalsy: true }).trim().isLength({ min: 6 }).withMessage("Numéro de téléphone invalide"),
  body("notes").optional().isString().trim().isLength({ max: 1000 }).withMessage("Les notes ne peuvent pas dépasser 1000 caractères"),
];

export const validateInvoice = [
  body("customerId").notEmpty().withMessage("Le client est requis"),
  body("items").isArray({ min: 1 }).withMessage("Au moins un article est requis"),
  body("items.*.productId").notEmpty().withMessage("L'identifiant produit est requis"),
  body("items.*.quantity").isInt({ min: 1 }).withMessage("La quantité doit être au moins 1"),
  body("items.*.unitPrice").optional().isFloat({ min: 0 }).withMessage("Le prix unitaire doit être positif"),
  body("discount").optional().isFloat({ min: 0 }).withMessage("La remise doit être positive"),
  body("amountPaid").optional().isFloat({ min: 0 }).withMessage("Le montant payé doit être positif"),
  body("paymentMethod").optional().isIn(["cash", "wave", "orange_money", "bank_transfer", "other"]).withMessage("Méthode de paiement invalide"),
  body("notes").optional().isString().trim().isLength({ max: 1000 }).withMessage("Les notes ne peuvent pas dépasser 1000 caractères"),
];

export const validateInvoiceUpdate = [
  body("amountPaid").optional().isFloat({ min: 0 }).withMessage("Le montant payé doit être positif"),
  body("discount").optional().isFloat({ min: 0 }).withMessage("La remise doit être positive"),
  body("paymentMethod").optional().isIn(["cash", "wave", "orange_money", "bank_transfer", "other"]).withMessage("Méthode de paiement invalide"),
  body("notes").optional().isString().trim().isLength({ max: 1000 }).withMessage("Les notes ne peuvent pas dépasser 1000 caractères"),
];
