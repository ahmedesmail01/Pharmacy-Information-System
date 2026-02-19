import api from "./axios";
import {
  ApiResponse,
  BranchDto,
  CreateBranchDto,
  UpdateBranchDto,
  PagedResult,
  QueryRequest,
} from "@/types";

export const branchService = {
  query: (req: QueryRequest) =>
    api.post<ApiResponse<PagedResult<BranchDto>>>("/api/Branch/query", req),

  getAll: () => api.get<ApiResponse<BranchDto[]>>("/api/Branch"),

  getById: (id: string) => api.get<ApiResponse<BranchDto>>(`/api/Branch/${id}`),

  create: (dto: CreateBranchDto) =>
    api.post<ApiResponse<BranchDto>>("/api/Branch", dto),

  update: (id: string, dto: UpdateBranchDto) =>
    api.put<ApiResponse<BranchDto>>(`/api/Branch/${id}`, dto),

  delete: (id: string) => api.delete<ApiResponse>(`/api/Branch/${id}`),
};
