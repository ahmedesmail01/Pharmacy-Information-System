import api from "./axios";
import {
  ApiResponse,
  PagedResult,
  QueryRequest,
  StockTransactionReturnDto,
  CreateStockTransactionReturnDto,
} from "@/types";

export const stockTransactionReturnService = {
  query: (req: QueryRequest) =>
    api.post<ApiResponse<PagedResult<StockTransactionReturnDto>>>(
      "/api/StockTransactionReturn/query",
      req,
    ),
  getById: (id: string) =>
    api.get<ApiResponse<StockTransactionReturnDto>>(
      `/api/StockTransactionReturn/${id}`,
    ),
  create: (data: CreateStockTransactionReturnDto) =>
    api.post<ApiResponse<StockTransactionReturnDto>>(
      "/api/StockTransactionReturn",
      data,
    ),
};
