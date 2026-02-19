// ─── Base API Response ───────────────────────────────────────────────────────

export interface ApiResponse<T = null> {
  success: boolean;
  message: string | null;
  data: T;
  errors: Record<string, string[]> | null;
  innerException: string | null;
  statusCode: number;
  timestamp: string;
  traceId: string | null;
}

export interface PagedResult<T> {
  data: T[];
  totalRecords: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  metadata: Record<string, unknown> | null;
}

// ─── Query / Filter System ────────────────────────────────────────────────────

export enum FilterOperation {
  Equals = 0,
  NotEquals = 1,
  Contains = 2,
  StartsWith = 3,
  EndsWith = 4,
  GreaterThan = 5,
  LessThan = 6,
  GreaterThanOrEqual = 7,
  LessThanOrEqual = 8,
  In = 9,
  NotIn = 10,
  IsNull = 11,
  IsNotNull = 12,
}

export interface FilterRequest {
  propertyName: string;
  value: string;
  operation: FilterOperation;
}

export interface SortRequest {
  sortBy: string;
  sortDirection: "asc" | "desc";
}

export interface PaginationRequest {
  getAll?: boolean;
  pageNumber: number;
  pageSize: number;
}

export interface DataRequest {
  filters?: FilterRequest[];
  sort?: SortRequest[];
  pagination: PaginationRequest;
  columns?: string[];
}

export interface QueryRequest {
  request: DataRequest;
}

// ─── Auth ─────────────────────────────────────────────────────────────────────

export interface LoginDto {
  username: string;
  password: string;
  rememberMe?: boolean;
}

export interface RegisterDto {
  username: string;
  password: string;
  confirmPassword: string;
  email?: string;
  mobile?: string;
  firstName: string;
  middleName?: string;
  lastName: string;
  gender?: string; // UUID
  birthDate?: string;
  roleId?: string; // UUID
}

export interface RefreshTokenDto {
  token: string;
  refreshToken: string;
}

export interface AuthResponseDto {
  token: string | null;
  refreshToken: string | null;
  expires: string;
  user: SystemUserDto;
}

// ─── SystemUser ───────────────────────────────────────────────────────────────

export interface SystemUserDto {
  oid: string;
  username: string;
  email?: string;
  mobile?: string;
  firstName: string;
  middleName?: string;
  lastName: string;
  fullName?: string;
  roleId: number;
  roleName?: string;
  branchId?: string;
  branchName?: string;
  status: number;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateSystemUserDto {
  username: string;
  password?: string;
  fullName: string;
  email?: string;
  mobile?: string;
  roleId: number;
  branchId: string;
  status: number;
}

export interface UpdateSystemUserDto extends CreateSystemUserDto {
  oid: string;
}

// ─── Role ─────────────────────────────────────────────────────────────────────

export interface RoleDto {
  oid: string;
  roleName: string;
  roleNameAr?: string;
  userCount?: number;
  status?: number;
}

export interface CreateRoleDto {
  roleName: string;
  roleNameAr?: string;
  status?: number;
}

export interface UpdateRoleDto extends CreateRoleDto {
  oid: string;
}

// ─── Branch ───────────────────────────────────────────────────────────────────

export interface BranchDto {
  oid: string;
  branchCode: string | null;
  branchName: string;
  gln: string | null;
  city: string | null;
  district: string | null;
  address: string | null;
  status: number | null;
  createdAt?: string;
  userCount: number;
  stockCount: number;
}

export interface CreateBranchDto {
  branchCode?: string;
  branchName: string;
  gln?: string;
  city?: string;
  district?: string;
  address?: string;
  status?: number;
}

export interface UpdateBranchDto extends CreateBranchDto {
  oid: string;
}

// ─── Product ──────────────────────────────────────────────────────────────────

export interface ProductDto {
  oid: string;
  gtin: string | null;
  drugName: string;
  genericName: string | null;
  productTypeId: string | null;
  productTypeName: string | null;
  strengthValue: string | null;
  strengthUnit: string | null;
  fullStrength: string | null;
  packageType: string | null;
  packageSize: string | null;
  price: number | null;
  registrationNumber: string | null;
  volume: number | null;
  unitOfVolume: string | null;
  availableQuantity?: number;
  isExportable: boolean;
  isImportable: boolean;
  drugStatus: string | null;
  marketingStatus: string | null;
  legalStatus: string | null;
  domainId: string | null;
  manufacturer: string | null;
  countryOfOrigin: string | null;
  minStockLevel: number | null;
  maxStockLevel: number | null;
  status: number | null;
  createdAt?: string;
}

export interface CreateProductDto {
  gtin?: string;
  drugName: string;
  genericName?: string;
  productTypeId?: string;
  strengthValue?: string;
  strengthUnit?: string;
  packageType?: string;
  packageSize?: string;
  price?: number;
  registrationNumber?: string;
  volume?: number;
  unitOfVolume?: string;
  isExportable?: boolean;
  isImportable?: boolean;
  drugStatus?: string;
  marketingStatus?: string;
  legalStatus?: string;
  manufacturer?: string;
  countryOfOrigin?: string;
  minStockLevel?: number;
  maxStockLevel?: number;
  status?: number;
}

export interface UpdateProductDto extends CreateProductDto {
  oid: string;
}

// ─── Stakeholder ─────────────────────────────────────────────────────────────

export interface StakeholderDto {
  oid: string;
  fullName: string;
  stakeholderTypeCode: string;
  stakeholderTypeName?: string;
  email?: string;
  phoneNumber?: string;
  address?: string;
  taxNumber?: string;
  crNumber?: string;
  status: number | null;
  createdAt?: string;
}

export interface CreateStakeholderDto {
  fullName: string;
  stakeholderTypeCode: string;
  email?: string;
  phoneNumber?: string;
  address?: string;
  taxNumber?: string;
  crNumber?: string;
  status?: number;
}

export interface UpdateStakeholderDto extends CreateStakeholderDto {
  oid: string;
}

// ─── Sales ────────────────────────────────────────────────────────────────────

export interface SalesInvoiceItemDto {
  oid: string;
  invoiceId: string;
  productId: string;
  productName: string | null;
  productGTIN: string | null;
  quantity: number;
  unitPrice: number;
  taxAmount?: number;
  totalPrice: number;
  batchNumber: string | null;
  expiryDate: string | null;
}

export interface SalesInvoiceDto {
  oid: string;
  invoiceNumber: string | null;
  branchId: string;
  branchName: string | null;
  customerName: string | null;
  customerPhone: string | null;
  customerEmail: string | null;
  taxAmount: number | null;
  totalAmount: number | null;
  invoiceDate: string | null;
  paymentMethodId: string | null;
  paymentMethodName: string | null;
  invoiceStatusName: string | null;
  createdByName?: string;
  items: SalesInvoiceItemDto[] | null;
}

export interface CreateSalesInvoiceItemDto {
  productId: string;
  quantity: number;
  unitPrice: number;
  taxAmount: number;
}

export interface CreateSalesInvoiceDto {
  branchId: string;
  customerId?: string;
  invoiceDate: string;
  items: CreateSalesInvoiceItemDto[];
  totalAmount: number;
  taxAmount: number;
  paymentMethodId?: string;
}

// ─── Stock ────────────────────────────────────────────────────────────────────

export interface StockDto {
  oid: string;
  productId: string;
  productName: string | null;
  productGTIN: string | null;
  branchId: string;
  branchName: string | null;
  quantity: number | null;
  reservedQuantity: number | null;
  availableQuantity: number;
  minStockLevel?: number;
  expiryDate?: string;
  status: number | null;
}

export interface StockTransactionDto {
  oid: string;
  productId: string;
  productName: string | null;
  productGTIN: string | null;
  fromBranchId: string | null;
  fromBranchName: string | null;
  toBranchId: string | null;
  toBranchName: string | null;
  quantity: number;
  transactionTypeName: string;
  referenceNumber: string | null;
  transactionDate: string;
  batchNumber: string | null;
  expiryDate: string | null;
}

export interface CreateStockInDto {
  productId: string;
  branchId: string;
  supplierId?: string;
  quantity: number;
  unitCost: number;
  batchNumber?: string;
  expiryDate?: string;
  referenceNumber?: string;
}

export interface CreateStockTransferDto {
  productId: string;
  fromBranchId: string;
  toBranchId: string;
  quantity: number;
  batchNumber?: string;
  referenceNumber?: string;
}

// ─── AppLookup ────────────────────────────────────────────────────────────────

export interface AppLookupDetailDto {
  oid: string;
  lookupMasterID: string;
  lookupDetailCode: string;
  valueNameAr: string | null;
  valueNameEn: string | null;
  status: number;
}

export interface AppLookupMasterDto {
  oid: string;
  lookupCode: string;
  lookupNameAr: string | null;
  lookupNameEn: string | null;
  lookupName?: string; // For query results
  status: number;
  detailCount?: number;
  lookupDetails: AppLookupDetailDto[] | null;
}

export interface CreateAppLookupMasterDto {
  lookupCode: string;
  lookupNameAr: string;
  lookupNameEn: string;
  status: number;
}

export interface CreateAppLookupDetailDto {
  masterId: string;
  lookupDetailCode: string;
  valueNameAr: string;
  valueNameEn: string;
  status: number;
}
