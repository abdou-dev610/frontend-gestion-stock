# StockFact Pro — ERP de facturation et gestion de stock

Application web SaaS complète pour la facturation et la gestion de stock pour PME et commerces.

## Stack technique

**Frontend** (racine du projet)
- TanStack Start + TanStack Router
- TypeScript, React 19
- Tailwind CSS v4
- React Query (TanStack Query)
- Recharts, Lucide React, Axios

**Backend** (`backend/`)
- Node.js + Express.js
- MongoDB Atlas + Mongoose
- JWT Authentication
- PDFKit (génération PDF)

---

## Installation et lancement

### 1. Cloner le projet
```bash
git clone <repo-url>
```

### 2. Configurer le backend
```bash
cd backend
cp .env.example .env
# Modifier .env avec votre MONGO_URI MongoDB Atlas
npm install
```

### 3. Lancer le backend
```bash
cd backend
npm run dev
# Serveur sur http://localhost:5000
```

### 4. Seed des données de démo
```bash
cd backend
npm run seed
```

### 5. Configurer le frontend
```bash
# À la racine du projet
# Créer un fichier .env si besoin
echo "VITE_API_URL=http://localhost:5000/api" > .env
npm install
```

### 6. Lancer le frontend
```bash
npm run dev
# App sur http://localhost:5173
```

---

## Identifiants de test

| Champ    | Valeur                |
|----------|-----------------------|
| Email    | admin@stockfact.sn    |
| Password | Admin123456           |

---

## Routes API

| Méthode | Route                       | Description               |
|---------|-----------------------------|---------------------------|
| POST    | /api/auth/login             | Connexion                 |
| GET     | /api/auth/me                | Utilisateur courant       |
| GET     | /api/dashboard/stats        | Statistiques              |
| GET     | /api/dashboard/sales-chart  | Graphique ventes          |
| GET     | /api/dashboard/low-stock    | Produits stock faible     |
| GET     | /api/products               | Liste produits            |
| POST    | /api/products               | Créer produit             |
| PUT     | /api/products/:id           | Modifier produit          |
| DELETE  | /api/products/:id           | Supprimer produit         |
| GET     | /api/stock                  | Inventaire                |
| POST    | /api/stock/movement         | Mouvement de stock        |
| GET     | /api/stock/movements        | Historique mouvements     |
| GET     | /api/customers              | Liste clients             |
| POST    | /api/customers              | Créer client              |
| GET     | /api/invoices               | Liste factures            |
| POST    | /api/invoices               | Créer facture             |
| GET     | /api/invoices/:id/pdf       | Télécharger PDF           |
| GET     | /api/settings               | Paramètres entreprise     |
| PUT     | /api/settings               | Mettre à jour paramètres  |

---

## Variables d'environnement

### Backend (`backend/.env`)
```env
PORT=5000
MONGO_URI=mongodb+srv://USERNAME:PASSWORD@cluster.mongodb.net/stockfact_pro
JWT_SECRET=your_secret_key
JWT_EXPIRES_IN=7d
FRONTEND_URL=http://localhost:5173
ALLOWED_ORIGINS=http://localhost:5173,http://localhost:5174
NODE_ENV=development
```

### Frontend (`.env` racine)
```env
VITE_API_URL=http://localhost:5000/api
```

---

## Déploiement

### Backend → Render
1. Créer un Web Service sur [render.com](https://render.com)
2. Root Directory: `backend`
3. Build Command: `npm install`
4. Start Command: `npm start`
5. Ajouter les variables d'environnement (MONGO_URI, JWT_SECRET, FRONTEND_URL, etc.)

### Frontend → Vercel
1. Importer le repo sur [vercel.com](https://vercel.com)
2. Framework Preset: Other
3. Root Directory: `.` (racine)
4. Build Command: `npm run build`
5. Output Directory: `dist/client`
6. Ajouter la variable: `VITE_API_URL=https://votre-backend.onrender.com/api`

---

## Connexion MongoDB Atlas
1. Créer un compte sur [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
2. Créer un cluster (gratuit M0)
3. Créer un utilisateur base de données
4. Whitelist l'IP `0.0.0.0/0` (tous)
5. Copier la connection string dans `backend/.env` → `MONGO_URI`
6. Lancer `npm run seed` pour insérer les données

---

## Fonctionnalités

- ✅ Authentification JWT sécurisée
- ✅ Dashboard avec statistiques en temps réel
- ✅ Graphique évolution des ventes (Recharts)
- ✅ Gestion produits (CRUD + statuts stock)
- ✅ Gestion stock avec mouvements (entrée/sortie/ajustement)
- ✅ Gestion clients (CRUD + historique factures)
- ✅ Création factures avec calcul automatique
- ✅ Diminution automatique du stock à la facturation
- ✅ Génération PDF factures (PDFKit)
- ✅ Paramètres entreprise
- ✅ Interface responsive (mobile/tablette/desktop)
- ✅ Design moderne SaaS
