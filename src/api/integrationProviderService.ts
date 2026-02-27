import api from "./axios";
import {
  ApiResponse,
  BooleanApiResponse,
  IntegrationProviderDto,
  CreateIntegrationProviderDto,
  UpdateIntegrationProviderDto,
} from "@/types";

export const integrationProviderService = {
  // Returns full list — no pagination on this endpoint
  getAll: () =>
    api.get<ApiResponse<IntegrationProviderDto[]>>("/api/IntegrationProvider"),

  getById: (id: string) =>
    api.get<ApiResponse<IntegrationProviderDto>>(
      `/api/IntegrationProvider/${id}`,
    ),

  create: (dto: CreateIntegrationProviderDto) =>
    api.post<ApiResponse<IntegrationProviderDto>>(
      "/api/IntegrationProvider",
      dto,
    ),

  update: (id: string, dto: UpdateIntegrationProviderDto) =>
    api.put<ApiResponse<IntegrationProviderDto>>(
      `/api/IntegrationProvider/${id}`,
      dto,
    ),

  // NOTE: Returns BooleanApiResponse — check data.data === true for success
  delete: (id: string) =>
    api.delete<BooleanApiResponse>(`/api/IntegrationProvider/${id}`),
};
