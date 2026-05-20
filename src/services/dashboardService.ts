import api from "./api";

export const dashboardService = {
  stats: () => api.get("/dashboard/stats"),
  recentInvoices: () => api.get("/dashboard/recent-invoices"),
  lowStock: () => api.get("/dashboard/low-stock"),
  salesChart: () => api.get("/dashboard/sales-chart"),
};
