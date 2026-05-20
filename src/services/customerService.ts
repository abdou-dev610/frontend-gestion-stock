import api from "./api";
export const customerService = {
  list: () => api.get("/customers"),
  create: (data: unknown) => api.post("/customers", data),
  update: (id: string, data: unknown) => api.put(`/customers/${id}`, data),
  remove: (id: string) => api.delete(`/customers/${id}`),
};
