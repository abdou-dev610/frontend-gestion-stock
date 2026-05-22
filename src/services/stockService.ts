import api from "./api";

export const stockService = {
  list: () => api.get("/stock"),
  lowStock: () => api.get("/stock/low"),
  movements: (params?: { productId?: string; page?: number; limit?: number }) => api.get("/stock/movements", { params }),
  addMovement: (data: { productId: string; type: string; quantity: number; reason?: string }) =>
    api.post("/stock/movement", data),
};
