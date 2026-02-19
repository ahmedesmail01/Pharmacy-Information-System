import api from "./axios";
import {
  ApiResponse,
  AuthResponseDto,
  LoginDto,
  RegisterDto,
  RefreshTokenDto,
} from "@/types";

export const authService = {
  login: (dto: LoginDto) =>
    api.post<ApiResponse<AuthResponseDto>>("/api/Auth/login", dto),

  register: (dto: RegisterDto) =>
    api.post<ApiResponse<AuthResponseDto>>("/api/Auth/register", dto),

  logout: () => api.post<ApiResponse>("/api/Auth/logout"),

  refresh: (dto: RefreshTokenDto) =>
    api.post<ApiResponse<AuthResponseDto>>("/api/Auth/refresh", dto),
};
