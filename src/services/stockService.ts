import api from "./api";

export const stockService = {
  list: () => api.get("/stock"),
  lowStock: () => api.get("/stock/low"),
  movements: (productId?: string) => api.get("/stock/movements", { params: productId ? { productId } : {} }),
  addMovement: (data: { productId: string; type: string; quantity: number; reason?: string }) =>
    api.post("/stock/movement", data),
};
