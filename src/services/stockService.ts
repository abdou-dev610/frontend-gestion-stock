import api from "./api";
export const stockService = {
  list: () => api.get("/stock"),
  addMovement: (data: unknown) => api.post("/stock/movement", data),
  movements: () => api.get("/stock/movements"),
};
