import api from "./api";

export const customerService = {
  list: (params?: { search?: string; limit?: number; page?: number }) => api.get("/customers", { params }),
  get: (id: string) => api.get(`/customers/${id}`),
  create: (data: unknown) => api.post("/customers", data),
  update: (id: string, data: unknown) => api.put(`/customers/${id}`, data),
  remove: (id: string) => api.delete(`/customers/${id}`),
  invoices: (id: string) => api.get(`/customers/${id}/invoices`),
};
