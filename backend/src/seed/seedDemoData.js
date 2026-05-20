import dotenv from "dotenv";
dotenv.config();

import mongoose from "mongoose";
import User from "../models/User.js";
import Product from "../models/Product.js";
import Customer from "../models/Customer.js";
import Invoice from "../models/Invoice.js";
import StockMovement from "../models/StockMovement.js";
import Settings from "../models/Settings.js";

const MONGO_URI = process.env.MONGO_URI;
if (!MONGO_URI) {
  console.error("❌ MONGO_URI manquant dans .env");
  process.exit(1);
}

async function seed() {
  await mongoose.connect(MONGO_URI);
  console.log("✅ MongoDB connecté");

  // Nettoyer
  await Promise.all([
    User.deleteMany({}),
    Product.deleteMany({}),
    Customer.deleteMany({}),
    Invoice.deleteMany({}),
    StockMovement.deleteMany({}),
    Settings.deleteMany({}),
  ]);
  console.log("🗑️  Base de données nettoyée");

  // Admin
  const admin = await User.create({
    name: "Admin",
    email: "admin@stockfact.sn",
    password: "Admin123456",
    role: "admin",
  });
  console.log("👤 Admin créé:", admin.email);

  // Paramètres
  await Settings.create({
    companyName: "StockFact Pro SARL",
    phone: "77 123 45 67",
    email: "contact@stockfact.sn",
    address: "Dakar, Sénégal",
    ninea: "123456789",
    rccm: "SN-DKR-2024-B-12345",
    invoiceFooter: "Merci pour votre confiance ! Le meilleur partenaire de votre réussite.",
  });
  console.log("⚙️  Paramètres créés");

  // Produits
  const products = await Product.insertMany([
    { name: "Riz parfumé 50kg", reference: "PRD-001", category: "Alimentaire", purchasePrice: 15000, salePrice: 22000, quantity: 50, alertThreshold: 20 },
    { name: "Huile végétale 5L", reference: "PRD-002", category: "Alimentaire", purchasePrice: 4500, salePrice: 6500, quantity: 8, alertThreshold: 15 },
    { name: "Savon liquide 1L", reference: "PRD-003", category: "Hygiène", purchasePrice: 1000, salePrice: 1500, quantity: 0, alertThreshold: 10 },
    { name: "Cahier 100 pages", reference: "PRD-004", category: "Fourniture", purchasePrice: 350, salePrice: 600, quantity: 120, alertThreshold: 30 },
    { name: "Sucre en poudre 1kg", reference: "PRD-005", category: "Alimentaire", purchasePrice: 600, salePrice: 900, quantity: 75, alertThreshold: 20 },
    { name: "Lait en poudre 400g", reference: "PRD-006", category: "Alimentaire", purchasePrice: 2200, salePrice: 3000, quantity: 12, alertThreshold: 15 },
  ]);
  console.log(`📦 ${products.length} produits créés`);

  // Clients
  const customers = await Customer.insertMany([
    { fullName: "Boutique Diop", phone: "77 123 45 67", email: "diop@boutique.sn", address: "Dakar, Sénégal", type: "entreprise" },
    { fullName: "Marché Sandaga", phone: "78 234 56 78", email: "contact@sandaga.sn", address: "Dakar Plateau", type: "grossiste" },
    { fullName: "Commerce Ndiaye", phone: "76 345 67 89", email: "ndiaye@commerce.sn", address: "Thiès", type: "particulier" },
    { fullName: "Entreprise Fall", phone: "77 456 78 90", email: "fall@entreprise.sn", address: "Saint-Louis", type: "grossiste" },
  ]);
  console.log(`👥 ${customers.length} clients créés`);

  // Mouvements de stock initiaux
  const movements = products.map(p => ({
    product: p._id,
    type: "in",
    quantity: p.quantity,
    previousQuantity: 0,
    newQuantity: p.quantity,
    reason: "Stock initial",
    createdBy: admin._id,
  }));
  await StockMovement.insertMany(movements);

  // Factures exemples
  const inv1Items = [
    { product: products[0]._id, productName: products[0].name, quantity: 10, unitPrice: 22000, total: 220000 },
    { product: products[4]._id, productName: products[4].name, quantity: 20, unitPrice: 900, total: 18000 },
  ];
  const inv1 = await Invoice.create({
    invoiceNumber: "FAC-2024-001",
    customer: customers[0]._id,
    items: inv1Items,
    discount: 0,
    amountPaid: 238000,
    paymentMethod: "cash",
    createdBy: admin._id,
  });

  const inv2Items = [
    { product: products[1]._id, productName: products[1].name, quantity: 5, unitPrice: 6500, total: 32500 },
    { product: products[3]._id, productName: products[3].name, quantity: 50, unitPrice: 600, total: 30000 },
  ];
  const inv2 = await Invoice.create({
    invoiceNumber: "FAC-2024-002",
    customer: customers[1]._id,
    items: inv2Items,
    discount: 5000,
    amountPaid: 30000,
    paymentMethod: "wave",
    createdBy: admin._id,
  });

  const inv3Items = [
    { product: products[5]._id, productName: products[5].name, quantity: 6, unitPrice: 3000, total: 18000 },
  ];
  const inv3 = await Invoice.create({
    invoiceNumber: "FAC-2024-003",
    customer: customers[2]._id,
    items: inv3Items,
    discount: 0,
    amountPaid: 0,
    paymentMethod: "cash",
    createdBy: admin._id,
  });

  console.log(`🧾 3 factures exemples créées`);
  console.log("\n✅ Seed terminé avec succès !\n");
  console.log("🔑 Identifiants admin:");
  console.log("   Email    : admin@stockfact.sn");
  console.log("   Password : Admin123456\n");

  process.exit(0);
}

seed().catch(err => {
  console.error("❌ Erreur seed:", err);
  process.exit(1);
});
