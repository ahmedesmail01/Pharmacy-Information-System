import api from "./axios";
import {
  ApiResponse,
  BooleanApiResponse,
  AppLookupMasterDto,
  AppLookupDetailDto,
  CreateAppLookupMasterDto,
  UpdateAppLookupMasterDto,
  CreateAppLookupDetailDto,
  UpdateAppLookupDetailDto,
  PagedResult,
  QueryRequest,
} from "@/types";

export const lookupService = {
  // ── Master ────────────────────────────────────────────────────────────────

  query: (req: QueryRequest) =>
    api.post<ApiResponse<PagedResult<AppLookupMasterDto>>>(
      "/api/AppLookup/query",
      req,
    ),

  // Get by UUID (new preferred endpoint)
  getById: (id: string, includeDetails = true) =>
    api.get<ApiResponse<AppLookupMasterDto>>(`/api/AppLookup/masters/${id}`, {
      params: { includeDetails },
    }),

  // Get by lookup code (new clean URL)
  getByCode: (lookupCode: string, includeDetails = true) =>
    api.get<ApiResponse<AppLookupMasterDto>>(
      `/api/AppLookup/masters/code/${lookupCode}`,
      { params: { includeDetails } },
    ),

  createMaster: (dto: CreateAppLookupMasterDto) =>
    api.post<ApiResponse<AppLookupMasterDto>>("/api/AppLookup/masters", dto),

  updateMaster: (id: string, dto: UpdateAppLookupMasterDto) =>
    api.put<ApiResponse<AppLookupMasterDto>>(
      `/api/AppLookup/masters/${id}`,
      dto,
    ),

  deleteMaster: (id: string) =>
    api.delete<BooleanApiResponse>(`/api/AppLookup/masters/${id}`),

  // ── Details ───────────────────────────────────────────────────────────────

  getDetails: (masterId: string) =>
    api.get<ApiResponse<AppLookupDetailDto[]>>(
      `/api/AppLookup/masters/${masterId}/details`,
    ),

  createDetail: (dto: CreateAppLookupDetailDto) =>
    api.post<ApiResponse<AppLookupDetailDto>>("/api/AppLookup/details", dto),

  updateDetail: (id: string, dto: UpdateAppLookupDetailDto) =>
    api.put<ApiResponse<AppLookupDetailDto>>(
      `/api/AppLookup/details/${id}`,
      dto,
    ),

  deleteDetail: (id: string) =>
    api.delete<BooleanApiResponse>(`/api/AppLookup/details/${id}`),
};
