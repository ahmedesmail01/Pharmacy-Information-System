import api from "./axios";
import {
  ApiResponse,
  StockDto,
  StockTransactionDto,
  CreateStockInDto,
  CreateStockTransferDto,
  PagedResult,
  QueryRequest,
} from "@/types";

export const stockService = {
  // ── Stock Levels ──────────────────────────────────────────────────────────
  query: (req: QueryRequest) =>
    api.post<ApiResponse<PagedResult<StockDto>>>("/api/Stock/query", req),

  getByBranch: (branchId: string) =>
    api.get<ApiResponse<StockDto[]>>(`/api/Stock/branch/${branchId}`),

  // ── Stock Transactions ────────────────────────────────────────────────────
  queryTransactions: (req: QueryRequest) =>
    api.post<ApiResponse<PagedResult<StockTransactionDto>>>(
      "/api/Stock/transactions/query",
      req,
    ),

  getTransactions: (params?: {
    branchId?: string;
    startDate?: string;
    endDate?: string;
    transactionTypeId?: string;
  }) =>
    api.get<ApiResponse<StockTransactionDto[]>>("/api/Stock/transactions", {
      params,
    }),

  // ── Stock In ──────────────────────────────────────────────────────────────
  stockIn: (dto: CreateStockInDto) =>
    api.post<ApiResponse<StockTransactionDto>>("/api/Stock/in", dto),

  // ── Stock Transfer ────────────────────────────────────────────────────────
  transfer: (dto: CreateStockTransferDto) =>
    api.post<ApiResponse<StockTransactionDto>>("/api/Stock/transfer", dto),
};
