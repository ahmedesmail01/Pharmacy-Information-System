import api from "./axios";
import {
  ApiResponse,
  BooleanApiResponse,
  BranchIntegrationSettingDto,
  CreateBranchIntegrationSettingDto,
  UpdateBranchIntegrationSettingDto,
} from "@/types";

export const branchIntegrationSettingService = {
  // Get all settings for a specific branch
  getByBranch: (branchId: string) =>
    api.get<ApiResponse<BranchIntegrationSettingDto[]>>(
      `/api/BranchIntegrationSetting/branch/${branchId}`,
    ),

  // Get one specific setting by branch + provider combination
  getByBranchAndProvider: (branchId: string, providerId: string) =>
    api.get<ApiResponse<BranchIntegrationSettingDto>>(
      `/api/BranchIntegrationSetting/branch/${branchId}/provider/${providerId}`,
    ),

  create: (dto: CreateBranchIntegrationSettingDto) =>
    api.post<ApiResponse<BranchIntegrationSettingDto>>(
      "/api/BranchIntegrationSetting",
      dto,
    ),

  update: (id: string, dto: UpdateBranchIntegrationSettingDto) =>
    api.put<ApiResponse<BranchIntegrationSettingDto>>(
      `/api/BranchIntegrationSetting/${id}`,
      dto,
    ),

  // NOTE: Returns BooleanApiResponse — check data.data === true for success
  delete: (id: string) =>
    api.delete<BooleanApiResponse>(`/api/BranchIntegrationSetting/${id}`),
};
