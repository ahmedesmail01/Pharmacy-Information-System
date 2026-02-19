import {
  QueryRequest,
  FilterRequest,
  SortRequest,
  PaginationRequest,
} from "@/types";

export function buildQuery(
  pagination: PaginationRequest,
  filters: FilterRequest[] = [],
  sort: SortRequest[] = [],
): QueryRequest {
  return { request: { filters, sort, pagination } };
}

export function searchFilter(field: string, value: string): FilterRequest {
  return { propertyName: field, value, operation: 2 }; // Contains
}

export function dateRangeFilters(
  field: string,
  startDate?: string,
  endDate?: string,
): FilterRequest[] {
  const filters: FilterRequest[] = [];
  if (startDate)
    filters.push({ propertyName: field, value: startDate, operation: 7 });
  if (endDate)
    filters.push({ propertyName: field, value: endDate, operation: 8 });
  return filters;
}
