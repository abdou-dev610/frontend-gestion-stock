import api from "./api";

export const productService = {
  list: (params?: { search?: string; category?: string; limit?: number; page?: number }) => api.get("/products", { params }),
  get: (id: string) => api.get(`/products/${id}`),
  create: (data: unknown) => api.post("/products", data),
  update: (id: string, data: unknown) => api.put(`/products/${id}`, data),
  remove: (id: string) => api.delete(`/products/${id}`),
};
