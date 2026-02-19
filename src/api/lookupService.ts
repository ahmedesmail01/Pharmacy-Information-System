import api from "./axios";
import {
  ApiResponse,
  AppLookupMasterDto,
  AppLookupDetailDto,
  CreateAppLookupMasterDto,
  CreateAppLookupDetailDto,
  PagedResult,
  QueryRequest,
} from "@/types";

export const lookupService = {
  query: (req: QueryRequest) =>
    api.post<ApiResponse<PagedResult<AppLookupMasterDto>>>(
      "/api/AppLookup/query",
      req,
    ),

  getByCode: (lookupCode: string, includeDetails = true) =>
    api.get<ApiResponse<AppLookupMasterDto>>(`/api/AppLookup/${lookupCode}`, {
      params: { includeDetails },
    }),

  getDetails: (masterID: string) =>
    api.get<ApiResponse<AppLookupDetailDto[]>>(
      `/api/AppLookup/${masterID}/details`,
    ),

  createMaster: (dto: CreateAppLookupMasterDto) =>
    api.post<ApiResponse<AppLookupMasterDto>>("/api/AppLookup/masters", dto),

  createDetail: (dto: CreateAppLookupDetailDto) =>
    api.post<ApiResponse<AppLookupDetailDto>>("/api/AppLookup/details", dto),
};
