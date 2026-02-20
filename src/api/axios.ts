import axios from "axios";
import { useAuthStore } from "@/store/authStore";

const API_BASE_URL = import.meta.env.PROD
  ? "" // same origin (relative paths starting with /api)
  : import.meta.env.VITE_API_BASE_URL || "http://50.6.228.16:4000";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { "Content-Type": "application/json" },
});

// Request interceptor: attach JWT
api.interceptors.request.use((config) => {
  const { token } = useAuthStore.getState();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Response interceptor: handle 401
api.interceptors.response.use(
  (res) => res,
  async (error) => {
    if (error.response?.status === 401) {
      const { token, refreshToken, setAuth, clearAuth, user } =
        useAuthStore.getState();

      if (refreshToken && token && user) {
        try {
          const { data } = await api.post(`${API_BASE_URL}/api/Auth/refresh`, {
            token,
            refreshToken,
          });
          if (data.success) {
            setAuth(data.data.token, data.data.refreshToken, user);
            error.config.headers.Authorization = `Bearer ${data.data.token}`;
            return api.request(error.config);
          }
        } catch {
          // Refresh failed
        }
      }
      clearAuth();
      window.location.href = "/login";
    }
    return Promise.reject(error);
  },
);

export default api;
