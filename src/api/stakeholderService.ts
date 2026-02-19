import api from "./axios";
import {
  ApiResponse,
  StakeholderDto,
  CreateStakeholderDto,
  UpdateStakeholderDto,
  PagedResult,
  QueryRequest,
} from "@/types";

export const stakeholderService = {
  query: (req: QueryRequest) =>
    api.post<ApiResponse<PagedResult<StakeholderDto>>>(
      "/api/Stakeholder/query",
      req,
    ),

  getAll: (params?: { stakeholderTypeId?: string }) =>
    api.get<ApiResponse<StakeholderDto[]>>("/api/Stakeholder", { params }),

  getById: (id: string) =>
    api.get<ApiResponse<StakeholderDto>>(`/api/Stakeholder/${id}`),

  create: (dto: CreateStakeholderDto) =>
    api.post<ApiResponse<StakeholderDto>>("/api/Stakeholder", dto),

  update: (id: string, dto: UpdateStakeholderDto) =>
    api.put<ApiResponse<StakeholderDto>>(`/api/Stakeholder/${id}`, dto),

  delete: (id: string) => api.delete<ApiResponse>(`/api/Stakeholder/${id}`),
};
