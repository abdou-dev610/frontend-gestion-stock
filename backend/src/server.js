import dotenv from "dotenv";
dotenv.config();

const REQUIRED_ENV = ["MONGO_URI", "JWT_SECRET"];
const missing = REQUIRED_ENV.filter((k) => !process.env[k]);
if (missing.length) {
  console.error(`❌ Variables d'environnement manquantes : ${missing.join(", ")}`);
  process.exit(1);
}

import app from "./app.js";
import connectDB from "./config/db.js";

const PORT = process.env.PORT || 5000;

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Serveur démarré sur le port ${PORT} [${process.env.NODE_ENV || "development"}]`);
  });
});
