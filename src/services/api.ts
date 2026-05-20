import axios from "axios";

const baseURL = (import.meta.env.VITE_API_URL as string) || "http://localhost:5000/api";

export const api = axios.create({
  baseURL,
  headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("stockfact_token");
    if (token) config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("stockfact_token");
      localStorage.removeItem("stockfact_auth");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export default api;
