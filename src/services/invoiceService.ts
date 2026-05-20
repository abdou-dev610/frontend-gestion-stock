import api from "./api";

export const invoiceService = {
  list: (params?: { search?: string; status?: string }) => api.get("/invoices", { params }),
  get: (id: string) => api.get(`/invoices/${id}`),
  create: (data: unknown) => api.post("/invoices", data),
  update: (id: string, data: unknown) => api.put(`/invoices/${id}`, data),
  remove: (id: string) => api.delete(`/invoices/${id}`),
  pdf: (id: string) => api.get(`/invoices/${id}/pdf`, { responseType: "blob" }),
};
