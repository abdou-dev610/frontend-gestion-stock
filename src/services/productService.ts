import api from "./api";
export const productService = {
  list: () => api.get("/products"),
  create: (data: unknown) => api.post("/products", data),
  update: (id: string, data: unknown) => api.put(`/products/${id}`, data),
  remove: (id: string) => api.delete(`/products/${id}`),
};
