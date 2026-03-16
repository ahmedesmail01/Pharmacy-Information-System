import api from "./axios";
import {
  ApiResponse,
  ReturnInvoiceDto,
  CreateReturnInvoiceDto,
  PagedResult,
  QueryRequest,
} from "@/types";

export const returnInvoiceService = {
  query: (req: QueryRequest) =>
    api.post<ApiResponse<PagedResult<ReturnInvoiceDto>>>(
      "/api/ReturnInvoice/query",
      req,
    ),

  getAll: (params?: {
    branchId?: string;
    cashierId?: string;
    startDate?: string;
    endDate?: string;
  }) =>
    api.get<ApiResponse<ReturnInvoiceDto[]>>("/api/ReturnInvoice", { params }),

  getById: (id: string) =>
    api.get<ApiResponse<ReturnInvoiceDto>>(`/api/ReturnInvoice/${id}`),

  create: (dto: CreateReturnInvoiceDto) =>
    api.post<ApiResponse<ReturnInvoiceDto>>("/api/ReturnInvoice", dto),
};
