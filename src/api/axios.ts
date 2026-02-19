import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://50.6.228.16:4000",
  headers: { "Content-Type": "application/json" },
});

// Request interceptor: attach JWT
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Response interceptor: handle 401
api.interceptors.response.use(
  (res) => res,
  async (error) => {
    if (error.response?.status === 401) {
      // Attempt token refresh
      const refreshToken = localStorage.getItem("refreshToken");
      const token = localStorage.getItem("token");
      if (refreshToken && token) {
        try {
          const { data } = await axios.post(
            `${import.meta.env.VITE_API_BASE_URL}/api/Auth/refresh`,
            { token, refreshToken },
          );
          if (data.success) {
            localStorage.setItem("token", data.data.token);
            localStorage.setItem("refreshToken", data.data.refreshToken);
            error.config.headers.Authorization = `Bearer ${data.data.token}`;
            return api.request(error.config);
          }
        } catch {
          // Refresh failed — redirect to login
        }
      }
      localStorage.clear();
      window.location.href = "/login";
    }
    return Promise.reject(error);
  },
);

export default api;
