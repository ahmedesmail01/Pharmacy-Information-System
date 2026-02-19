import api from "./axios";
import {
  ApiResponse,
  RoleDto,
  CreateRoleDto,
  UpdateRoleDto,
  PagedResult,
  QueryRequest,
} from "@/types";

export const roleService = {
  query: (req: QueryRequest) =>
    api.post<ApiResponse<PagedResult<RoleDto>>>("/api/Role/query", req),

  getAll: () => api.get<ApiResponse<RoleDto[]>>("/api/Role"),

  getById: (id: string) => api.get<ApiResponse<RoleDto>>(`/api/Role/${id}`),

  create: (dto: CreateRoleDto) =>
    api.post<ApiResponse<RoleDto>>("/api/Role", dto),

  update: (id: string, dto: UpdateRoleDto) =>
    api.put<ApiResponse<RoleDto>>(`/api/Role/${id}`, dto),

  delete: (id: string) => api.delete<ApiResponse>(`/api/Role/${id}`),
};
