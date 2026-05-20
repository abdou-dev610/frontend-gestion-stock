import api from "./api";
export const invoiceService = {
  list: () => api.get("/invoices"),
  get: (id: string) => api.get(`/invoices/${id}`),
  create: (data: unknown) => api.post("/invoices", data),
  pdf: (id: string) => api.get(`/invoices/${id}/pdf`, { responseType: "blob" }),
};
