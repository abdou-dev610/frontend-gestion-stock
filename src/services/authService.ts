import api from "./api";

export const authService = {
  login: async (email: string, password: string) => {
    const { data } = await api.post("/auth/login", { email, password });
    if (data.token) {
      localStorage.setItem("stockfact_token", data.token);
      localStorage.setItem("stockfact_auth", JSON.stringify(data.user));
    }
    return data;
  },
  logout: async () => {
    try { await api.post("/auth/logout"); } catch (_) {}
    localStorage.removeItem("stockfact_token");
    localStorage.removeItem("stockfact_auth");
  },
  getMe: async () => {
    const { data } = await api.get("/auth/me");
    return data.user;
  },
  getStoredUser: (): { id: string; name: string; email: string; role: string } | null => {
    try {
      const stored = localStorage.getItem("stockfact_auth");
      return stored ? JSON.parse(stored) : null;
    } catch { return null; }
  },
};

export default authService;
