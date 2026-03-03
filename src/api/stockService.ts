import api from "./axios";
import {
  ApiResponse,
  StockDto,
  StockTransactionDto,
  CreateStockInDto,
  CreateStockTransferDto,
  StockTransactionResponseDto,
  CreateStockTransactionDto as UpdateStockTransactionDto,
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

  queryStockTransactions: (req: QueryRequest) =>
    api.post<ApiResponse<PagedResult<StockTransactionResponseDto>>>(
      "/api/StockTransaction/query",
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
    api.post<ApiResponse<StockTransactionDto>>("/api/Stock/in", {
      ...dto,
      toBranchId: dto.branchId,
    }),

  // ── Stock Transfer ────────────────────────────────────────────────────────
  transfer: (dto: CreateStockTransferDto) =>
    api.post<ApiResponse<StockTransactionDto>>("/api/Stock/transfer", dto),

  createStockTransaction: (dto: UpdateStockTransactionDto) =>
    api.post<ApiResponse<StockTransactionResponseDto>>(
      "/api/StockTransaction",
      dto,
    ),

  getById: (id: string) =>
    api.get<ApiResponse<StockTransactionResponseDto>>(
      `/api/StockTransaction/${id}`,
    ),

  update: (id: string, dto: UpdateStockTransactionDto) =>
    api.put<ApiResponse<StockTransactionResponseDto>>(
      `/api/StockTransaction/${id}`,
      dto,
    ),
};
