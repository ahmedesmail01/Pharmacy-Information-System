import axios from "axios";
import { useAuthStore } from "@/store/authStore";

const IS_PROD = import.meta.env.PROD;
const DEV_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://50.6.228.16:4000";

const api = axios.create({
  // In dev, hit the backend directly. In prod, we'll rewrite URLs below.
  baseURL: IS_PROD ? "/" : DEV_BASE_URL,
  headers: { "Content-Type": "application/json" },
});

// Request interceptor: attach JWT + rewrite URL through Netlify proxy in prod
api.interceptors.request.use((config) => {
  const { token } = useAuthStore.getState();
  if (token) config.headers.Authorization = `Bearer ${token}`;

  if (IS_PROD && config.url) {
    // Strip leading slash to get the path, e.g. "api/Auth/login"
    const apiPath = config.url.replace(/^\//, "");
    config.url = `/.netlify/functions/proxy`;
    config.params = { path: apiPath, ...config.params };
    // Remove the baseURL so axios doesn't prepend it again
    config.baseURL = "";
  }

  return config;
});

// Response interceptor: handle 401
api.interceptors.response.use(
  (res) => res,
  async (error) => {
    if (
      error.response?.status === 401 &&
      error.response?.data?.message !== "Invalid username or password."
    ) {
      console.log("error", error);
      const { token, refreshToken, setAuth, clearAuth, user } =
        useAuthStore.getState();

      if (refreshToken && token && user) {
        try {
          const { data } = await api.post(`/api/Auth/refresh`, {
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
