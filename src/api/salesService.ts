import api from "./axios";
import {
  ApiResponse,
  SalesInvoiceDto,
  CreateSalesInvoiceDto,
  PagedResult,
  QueryRequest,
} from "@/types";

export const salesService = {
  query: (req: QueryRequest) =>
    api.post<ApiResponse<PagedResult<SalesInvoiceDto>>>(
      "/api/Sales/query",
      req,
    ),

  getAll: (params?: {
    branchId?: string;
    cashierId?: string;
    startDate?: string;
    endDate?: string;
  }) => api.get<ApiResponse<SalesInvoiceDto[]>>("/api/Sales", { params }),

  getById: (id: string) =>
    api.get<ApiResponse<SalesInvoiceDto>>(`/api/Sales/${id}`),

  create: (dto: CreateSalesInvoiceDto) =>
    api.post<ApiResponse<SalesInvoiceDto>>("/api/Sales", dto),
};
