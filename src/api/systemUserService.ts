import api from "./axios";
import {
  ApiResponse,
  SystemUserDto,
  CreateSystemUserDto,
  UpdateSystemUserDto,
  PagedResult,
  QueryRequest,
} from "@/types";

export const systemUserService = {
  query: (req: QueryRequest) =>
    api.post<ApiResponse<PagedResult<SystemUserDto>>>(
      "/api/SystemUser/query",
      req,
    ),

  getAll: (params?: {
    includeInactive?: boolean;
    roleId?: number;
    page?: number;
    pageSize?: number;
  }) => api.get<ApiResponse<SystemUserDto[]>>("/api/SystemUser", { params }),

  getById: (id: string) =>
    api.get<ApiResponse<SystemUserDto>>(`/api/SystemUser/${id}`),

  create: (dto: CreateSystemUserDto) =>
    api.post<ApiResponse<SystemUserDto>>("/api/SystemUser", dto),

  update: (id: string, dto: UpdateSystemUserDto) =>
    api.put<ApiResponse<SystemUserDto>>(`/api/SystemUser/${id}`, dto),

  delete: (id: string) => api.delete<ApiResponse>(`/api/SystemUser/${id}`),
};
