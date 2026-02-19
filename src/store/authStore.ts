import { create } from "zustand";
import { persist } from "zustand/middleware";
import { SystemUserDto } from "@/types";

interface AuthState {
  token: string | null;
  refreshToken: string | null;
  user: SystemUserDto | null;
  isAuthenticated: boolean;
  setAuth: (token: string, refreshToken: string, user: SystemUserDto) => void;
  clearAuth: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      refreshToken: null,
      user: null,
      isAuthenticated: false,
      setAuth: (token, refreshToken, user) =>
        set({ token, refreshToken, user, isAuthenticated: true }),
      clearAuth: () =>
        set({
          token: null,
          refreshToken: null,
          user: null,
          isAuthenticated: false,
        }),
    }),
    { name: "pharmacy-auth" },
  ),
);
