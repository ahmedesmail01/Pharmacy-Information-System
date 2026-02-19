import api from "./axios";
import {
  ApiResponse,
  ProductDto,
  CreateProductDto,
  UpdateProductDto,
  PagedResult,
  QueryRequest,
} from "@/types";

export const productService = {
  query: (req: QueryRequest) =>
    api.post<ApiResponse<PagedResult<ProductDto>>>("/api/Product/query", req),

  getAll: (params?: { productTypeId?: string; searchTerm?: string }) =>
    api.get<ApiResponse<ProductDto[]>>("/api/Product", { params }),

  getById: (id: string) =>
    api.get<ApiResponse<ProductDto>>(`/api/Product/${id}`),

  create: (dto: CreateProductDto) =>
    api.post<ApiResponse<ProductDto>>("/api/Product", dto),

  update: (id: string, dto: UpdateProductDto) =>
    api.put<ApiResponse<ProductDto>>(`/api/Product/${id}`, dto),

  delete: (id: string) => api.delete<ApiResponse>(`/api/Product/${id}`),
};
