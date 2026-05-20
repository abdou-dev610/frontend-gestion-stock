export type ProductStatus = "En stock" | "Stock faible" | "Rupture";
export type InvoiceStatus = "Payée" | "Partiellement payée" | "Non payée";

export interface Product {
  id: string;
  reference: string;
  name: string;
  category: string;
  purchasePrice: number;
  salePrice: number;
  quantity: number;
  threshold: number;
  status: ProductStatus;
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  email: string;
  address: string;
  type: "Détail" | "Grossiste";
  invoiceCount: number;
}

export interface Invoice {
  id: string;
  number: string;
  customer: string;
  date: string;
  totalAmount: number;
  paidAmount: number;
  status: InvoiceStatus;
  items?: { productId: string; name: string; quantity: number; unitPrice: number }[];
}

export interface StockMovement {
  id: string;
  product: string;
  quantity: number;
  type: "Achat fournisseur" | "Vente facture" | "Ajustement";
  reference?: string;
  date: string;
}

export const mockProducts: Product[] = [
  { id: "1", reference: "PRD-001", name: "Riz parfumé 50kg", category: "Alimentaire", purchasePrice: 15000, salePrice: 22000, quantity: 50, threshold: 20, status: "En stock" },
  { id: "2", reference: "PRD-002", name: "Huile végétale 5L", category: "Alimentaire", purchasePrice: 4500, salePrice: 6500, quantity: 8, threshold: 15, status: "Stock faible" },
  { id: "3", reference: "PRD-003", name: "Savon liquide 1L", category: "Hygiène", purchasePrice: 1000, salePrice: 1500, quantity: 0, threshold: 10, status: "Rupture" },
  { id: "4", reference: "PRD-004", name: "Cahier 100 pages", category: "Fourniture", purchasePrice: 350, salePrice: 600, quantity: 120, threshold: 30, status: "En stock" },
  { id: "5", reference: "PRD-005", name: "Sucre en poudre 1kg", category: "Alimentaire", purchasePrice: 600, salePrice: 900, quantity: 75, threshold: 20, status: "En stock" },
  { id: "6", reference: "PRD-006", name: "Lait en poudre 400g", category: "Alimentaire", purchasePrice: 2200, salePrice: 3000, quantity: 12, threshold: 15, status: "Stock faible" },
];

export const mockCustomers: Customer[] = [
  { id: "1", name: "Boutique Diop", phone: "77 123 45 67", email: "diop@boutique.sn", address: "Dakar, Sénégal", type: "Détail", invoiceCount: 12 },
  { id: "2", name: "Marché Sandaga", phone: "78 234 56 78", email: "contact@sandaga.sn", address: "Dakar Plateau", type: "Grossiste", invoiceCount: 23 },
  { id: "3", name: "Commerce Ndiaye", phone: "76 345 67 89", email: "ndiaye@commerce.sn", address: "Thiès", type: "Détail", invoiceCount: 5 },
  { id: "4", name: "Entreprise Fall", phone: "77 456 78 90", email: "fall@entreprise.sn", address: "Saint-Louis", type: "Grossiste", invoiceCount: 15 },
];

export const mockInvoices: Invoice[] = [
  { id: "1", number: "FAC-2024-001", customer: "Boutique Diop", date: "2024-05-18", totalAmount: 450000, paidAmount: 450000, status: "Payée" },
  { id: "2", number: "FAC-2024-002", customer: "Marché Sandaga", date: "2024-05-18", totalAmount: 280000, paidAmount: 100000, status: "Partiellement payée" },
  { id: "3", number: "FAC-2024-003", customer: "Commerce Ndiaye", date: "2024-05-17", totalAmount: 125000, paidAmount: 0, status: "Non payée" },
  { id: "4", number: "FAC-2024-004", customer: "Entreprise Fall", date: "2024-05-17", totalAmount: 890000, paidAmount: 890000, status: "Payée" },
  { id: "5", number: "FAC-2024-005", customer: "Magasin Sow", date: "2024-05-16", totalAmount: 340000, paidAmount: 200000, status: "Partiellement payée" },
];

export const mockSalesData = [
  { month: "Déc", value: 4200000 },
  { month: "Janv", value: 5800000 },
  { month: "Févr", value: 6100000 },
  { month: "Mars", value: 7400000 },
  { month: "Avr", value: 6900000 },
  { month: "Mai", value: 8600000 },
];

export const mockStockMovements: StockMovement[] = [
  { id: "1", product: "Riz parfumé 50kg", quantity: 20, type: "Achat fournisseur", date: "2024-05-18" },
  { id: "2", product: "Huile végétale 5L", quantity: -5, type: "Vente facture", reference: "FAC-2024-002", date: "2024-05-18" },
  { id: "3", product: "Cahier 100 pages", quantity: 50, type: "Achat fournisseur", date: "2024-05-17" },
  { id: "4", product: "Savon liquide 1L", quantity: -10, type: "Vente facture", reference: "FAC-2024-001", date: "2024-05-16" },
];

export const mockDashboardStats = {
  totalProducts: 1256,
  totalCustomers: 478,
  totalInvoices: 892,
  revenue: 12450000,
  lowStock: 23,
};
