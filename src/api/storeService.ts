import api from "./axios";
import {
  ApiResponse,
  StoreDto,
  PagedResult,
  QueryRequest,
  CreateStoreDto,
  UpdateStoreDto,
} from "@/types";

export const storeService = {
  query: (req: QueryRequest) =>
    api.post<ApiResponse<PagedResult<StoreDto>>>("/api/Store/query", req),

  getByBranchId: (branchId: string) => 
    api.get<ApiResponse<StoreDto[]>>(`/api/Store/by-branch/${branchId}`),

  getById: (id: string) => 
    api.get<ApiResponse<StoreDto>>(`/api/Store/${id}`),

  create: (data: CreateStoreDto) =>
    api.post<ApiResponse<StoreDto>>("/api/Store", data),

  update: (id: string, data: UpdateStoreDto) =>
    api.put<ApiResponse<StoreDto>>(`/api/Store/${id}`, data),

  delete: (id: string) =>
    api.delete<ApiResponse<string>>(`/api/Store/${id}`),
};
