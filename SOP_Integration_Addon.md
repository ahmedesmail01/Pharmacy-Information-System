# SOP — Integration Add-On Module
## BranchIntegrationSetting + IntegrationProvider
### Add to existing Pharmacy Information System React App

**Context:** This SOP is an add-on to the existing Pharmacy IS app. It assumes the base app (axios instance, auth store, shared components, routing, Tailwind design system) already exists. Follow this document to add the two new modules without touching existing code except where explicitly stated.

---

## TABLE OF CONTENTS

1. [New Endpoints Overview](#1-new-endpoints-overview)
2. [New TypeScript Interfaces](#2-new-typescript-interfaces)
3. [New Service Files](#3-new-service-files)
4. [New Pages & Components](#4-new-pages--components)
   - 4.1 [Integration Providers Page](#41-integration-providers-page)
   - 4.2 [Branch Integration Settings Page](#42-branch-integration-settings-page)
5. [Routing — What to Add](#5-routing--what-to-add)
6. [Sidebar — What to Add](#6-sidebar--what-to-add)
7. [Also: Updated Schemas for Existing Modules](#7-also-updated-schemas-for-existing-modules)

---

## 1. New Endpoints Overview

### IntegrationProvider

| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/api/IntegrationProvider` | Get all providers (no pagination) |
| POST | `/api/IntegrationProvider` | Create a new provider |
| GET | `/api/IntegrationProvider/{id}` | Get single provider by UUID |
| PUT | `/api/IntegrationProvider/{id}` | Update a provider |
| DELETE | `/api/IntegrationProvider/{id}` | Delete a provider → returns `BooleanApiResponse` |

### BranchIntegrationSetting

| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/api/BranchIntegrationSetting/branch/{branchId}` | Get all settings for a specific branch |
| GET | `/api/BranchIntegrationSetting/branch/{branchId}/provider/{providerId}` | Get one setting by branch + provider combo |
| POST | `/api/BranchIntegrationSetting` | Create a new setting |
| PUT | `/api/BranchIntegrationSetting/{id}` | Update a setting |
| DELETE | `/api/BranchIntegrationSetting/{id}` | Delete a setting → returns `BooleanApiResponse` |

> **Important:** DELETE on both resources returns `BooleanApiResponse` (not the standard `ApiResponse`). The service layer and error handling must account for this — check `data.data === true` for success confirmation instead of `data.success`.

---

## 2. New TypeScript Interfaces

Append these to the existing `src/types/index.ts` file.

```ts
// ─── BooleanApiResponse ───────────────────────────────────────────────────────
// Used as the return type for DELETE on IntegrationProvider and BranchIntegrationSetting

export interface BooleanApiResponse {
  success: boolean;
  message: string | null;
  data: boolean;
  errors: Record<string, string[]> | null;
  innerException: string | null;
  statusCode: number;
  timestamp: string;
  traceId: string | null;
}

// ─── IntegrationProvider ─────────────────────────────────────────────────────

export interface IntegrationProviderDto {
  oid: string;                  // UUID
  name: string | null;
  description: string | null;
  status: number;               // 1 = Active, 0 = Inactive
  statusName: string | null;    // resolved label from server
  createdAt: string;            // ISO datetime
  updatedAt: string | null;
}

export interface CreateIntegrationProviderDto {
  name?: string;
  description?: string;
  status: number;               // required: 1 or 0
}

export interface UpdateIntegrationProviderDto {
  oid: string;                  // UUID — required
  name?: string;
  description?: string;
  status: number;               // required
}

// ─── BranchIntegrationSetting ────────────────────────────────────────────────

export interface BranchIntegrationSettingDto {
  oid: string;                        // UUID
  integrationProviderId: string;      // UUID
  integrationProviderName: string | null;
  branchId: string;                   // UUID
  branchName: string | null;
  integrationKey: string | null;      // e.g. "api_key", "endpoint_url"
  integrationValue: string | null;    // the actual secret/value
  status: number;                     // 1 = Active, 0 = Inactive
  statusName: string | null;
  createdAt: string;
  updatedAt: string | null;
}

export interface CreateBranchIntegrationSettingDto {
  integrationProviderId: string;      // UUID — required
  branchId: string;                   // UUID — required
  integrationKey?: string;
  integrationValue?: string;
  status: number;                     // required
}

export interface UpdateBranchIntegrationSettingDto {
  oid: string;                        // UUID — required
  integrationProviderId: string;      // UUID — required
  branchId: string;                   // UUID — required
  integrationKey?: string;
  integrationValue?: string;
  status: number;                     // required
}
```

---

## 3. New Service Files

### 3.1 `src/api/integrationProviderService.ts`

```ts
import api from './axios';
import {
  ApiResponse,
  BooleanApiResponse,
  IntegrationProviderDto,
  CreateIntegrationProviderDto,
  UpdateIntegrationProviderDto,
} from '@/types';

export const integrationProviderService = {
  // Returns full list — no pagination on this endpoint
  getAll: () =>
    api.get<ApiResponse<IntegrationProviderDto[]>>('/api/IntegrationProvider'),

  getById: (id: string) =>
    api.get<ApiResponse<IntegrationProviderDto>>(`/api/IntegrationProvider/${id}`),

  create: (dto: CreateIntegrationProviderDto) =>
    api.post<ApiResponse<IntegrationProviderDto>>('/api/IntegrationProvider', dto),

  update: (id: string, dto: UpdateIntegrationProviderDto) =>
    api.put<ApiResponse<IntegrationProviderDto>>(`/api/IntegrationProvider/${id}`, dto),

  // NOTE: Returns BooleanApiResponse — check data.data === true for success
  delete: (id: string) =>
    api.delete<BooleanApiResponse>(`/api/IntegrationProvider/${id}`),
};
```

### 3.2 `src/api/branchIntegrationSettingService.ts`

```ts
import api from './axios';
import {
  ApiResponse,
  BooleanApiResponse,
  BranchIntegrationSettingDto,
  CreateBranchIntegrationSettingDto,
  UpdateBranchIntegrationSettingDto,
} from '@/types';

export const branchIntegrationSettingService = {
  // Get all settings for a specific branch
  getByBranch: (branchId: string) =>
    api.get<ApiResponse<BranchIntegrationSettingDto[]>>(
      `/api/BranchIntegrationSetting/branch/${branchId}`
    ),

  // Get one specific setting by branch + provider combination
  getByBranchAndProvider: (branchId: string, providerId: string) =>
    api.get<ApiResponse<BranchIntegrationSettingDto>>(
      `/api/BranchIntegrationSetting/branch/${branchId}/provider/${providerId}`
    ),

  create: (dto: CreateBranchIntegrationSettingDto) =>
    api.post<ApiResponse<BranchIntegrationSettingDto>>(
      '/api/BranchIntegrationSetting', dto
    ),

  update: (id: string, dto: UpdateBranchIntegrationSettingDto) =>
    api.put<ApiResponse<BranchIntegrationSettingDto>>(
      `/api/BranchIntegrationSetting/${id}`, dto
    ),

  // NOTE: Returns BooleanApiResponse — check data.data === true for success
  delete: (id: string) =>
    api.delete<BooleanApiResponse>(`/api/BranchIntegrationSetting/${id}`),
};
```

---

## 4. New Pages & Components

### New files to create:

```
src/pages/integrations/
├── IntegrationProvidersPage.tsx      ← Manage providers (CRUD)
├── IntegrationProviderForm.tsx       ← Create/Edit modal
├── BranchIntegrationsPage.tsx        ← Manage settings per branch
└── BranchIntegrationForm.tsx         ← Create/Edit modal
```

---

### 4.1 Integration Providers Page

**File:** `src/pages/integrations/IntegrationProvidersPage.tsx`  
**Route:** `/integrations/providers`

#### Purpose
Manage the master list of integration providers (e.g. "ZATCA", "NHC", "Seha"). These are the available integration systems that can be configured per branch.

#### API Calls Used
| When | Call |
|------|------|
| On mount | `GET /api/IntegrationProvider` |
| Create button | `POST /api/IntegrationProvider` |
| Edit icon clicked | `GET /api/IntegrationProvider/{id}` then open modal |
| Edit form submit | `PUT /api/IntegrationProvider/{id}` |
| Delete confirm | `DELETE /api/IntegrationProvider/{id}` |

#### Layout
`PageHeader` with title "Integration Providers" + "+ Add Provider" button.  
Simple flat list (no pagination since the endpoint doesn't support it).  
Table below.

#### Table Columns
| Column | Field | Notes |
|--------|-------|-------|
| Name | `name` | |
| Description | `description` | truncate at 60 chars |
| Status | `statusName` or `status` | Badge: 1=Active (green), 0=Inactive (gray) |
| Created | `createdAt` | formatted date |
| Updated | `updatedAt` | formatted date, show "—" if null |
| Actions | — | Edit icon + Delete icon |

#### IntegrationProviderForm Modal (`IntegrationProviderForm.tsx`)

Used for both **Create** and **Edit** modes.

**Form Fields:**

| Field | Input Type | Validation | Notes |
|-------|-----------|-----------|-------|
| `name` | text | optional | Provider display name, e.g. "ZATCA" |
| `description` | textarea | optional | Brief description of the integration |
| `status` | select | required | Options: `{ value: 1, label: 'Active' }`, `{ value: 0, label: 'Inactive' }` |

**Behavior:**
- Create mode: all fields empty, submit calls `POST /api/IntegrationProvider`
- Edit mode: pre-filled from `GET /api/IntegrationProvider/{id}`, submit calls `PUT /api/IntegrationProvider/{id}` with `oid` included in body
- On success: show `toast.success`, close modal, re-fetch list
- On failure: show `toast.error` with `data.message`

**Delete Behavior:**
- Open `ConfirmDialog` ("Are you sure you want to delete this provider?")
- On confirm: call `DELETE /api/IntegrationProvider/{id}`
- Check `res.data.data === true` (BooleanApiResponse) for success — NOT `res.data.success`
- On success: `toast.success('Provider deleted')`, re-fetch list
- On false/failure: `toast.error('Failed to delete provider')`

#### Complete Component Logic

```tsx
// IntegrationProvidersPage.tsx — skeleton

const [providers, setProviders] = useState<IntegrationProviderDto[]>([]);
const [isLoading, setIsLoading] = useState(false);
const [isModalOpen, setIsModalOpen] = useState(false);
const [selectedProvider, setSelectedProvider] = useState<IntegrationProviderDto | null>(null);
const [deleteTarget, setDeleteTarget] = useState<string | null>(null);

const loadProviders = async () => {
  setIsLoading(true);
  try {
    const res = await integrationProviderService.getAll();
    if (res.data.success) setProviders(res.data.data ?? []);
  } catch (e) { handleApiError(e); }
  finally { setIsLoading(false); }
};

useEffect(() => { loadProviders(); }, []);

const handleEdit = async (id: string) => {
  const res = await integrationProviderService.getById(id);
  if (res.data.success) {
    setSelectedProvider(res.data.data);
    setIsModalOpen(true);
  }
};

const handleDelete = async () => {
  if (!deleteTarget) return;
  const res = await integrationProviderService.delete(deleteTarget);
  if (res.data.data === true) {           // <-- BooleanApiResponse check
    toast.success('Provider deleted');
    loadProviders();
  } else {
    toast.error(res.data.message || 'Delete failed');
  }
  setDeleteTarget(null);
};
```

---

### 4.2 Branch Integration Settings Page

**File:** `src/pages/integrations/BranchIntegrationsPage.tsx`  
**Route:** `/integrations/settings`

#### Purpose
Configure which integration providers are active for each branch, and store the keys/credentials needed (e.g. API keys, endpoint URLs, certificates). Each branch can have multiple settings — one per provider.

#### API Calls Used
| When | Call |
|------|------|
| On mount | `GET /api/Branch` (populate branch selector dropdown) |
| Branch selected | `GET /api/BranchIntegrationSetting/branch/{branchId}` |
| Create button | Loads `GET /api/IntegrationProvider` for dropdown, then opens modal |
| Edit icon | `GET /api/BranchIntegrationSetting/branch/{branchId}/provider/{providerId}` |
| Edit form submit | `PUT /api/BranchIntegrationSetting/{id}` |
| Create form submit | `POST /api/BranchIntegrationSetting` |
| Delete confirm | `DELETE /api/BranchIntegrationSetting/{id}` |

#### Layout

```
┌────────────────────────────────────────────────────────────────┐
│  Page Header: "Branch Integration Settings"    [+ Add Setting] │
├────────────────────────────────────────────────────────────────┤
│  Branch Selector: [Select Branch ▼]                            │
├────────────────────────────────────────────────────────────────┤
│  (Table appears after branch is selected)                      │
│  No branch selected → show empty state: "Select a branch..."  │
└────────────────────────────────────────────────────────────────┘
```

The branch selector is a `<select>` dropdown populated by `GET /api/Branch`. Selecting a branch immediately triggers `GET /api/BranchIntegrationSetting/branch/{branchId}` and populates the table.

The "+ Add Setting" button is only enabled if a branch is selected.

#### Table Columns
| Column | Field | Notes |
|--------|-------|-------|
| Provider | `integrationProviderName` | |
| Integration Key | `integrationKey` | label/identifier of what's stored |
| Integration Value | `integrationValue` | **mask with `●●●●●●` by default**, toggle visibility with eye icon |
| Status | `statusName` or `status` | Badge |
| Created | `createdAt` | formatted date |
| Updated | `updatedAt` | formatted date, "—" if null |
| Actions | — | Edit + Delete icons |

> **Security note:** `integrationValue` often contains API keys or secrets. Always render it masked (`●●●●●●`) by default. Add an eye icon (`lucide-react: Eye / EyeOff`) to toggle visibility per row. Do NOT log this value.

#### BranchIntegrationForm Modal (`BranchIntegrationForm.tsx`)

Used for both **Create** and **Edit** modes.

**Props:**
```ts
interface BranchIntegrationFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  selectedBranchId: string;                       // pre-filled, locked in create mode
  editItem?: BranchIntegrationSettingDto | null;   // null = create mode
  providers: IntegrationProviderDto[];             // passed from parent (already loaded)
}
```

**Form Fields:**

| Field | Input Type | Validation | Notes |
|-------|-----------|-----------|-------|
| `branchId` | select (read-only in edit) | required | Pre-filled from page state; locked in edit mode |
| `integrationProviderId` | select | required | Dropdown from `providers` prop; locked in edit mode |
| `integrationKey` | text | optional | Label/key name (e.g. "API_KEY", "CLIENT_ID") |
| `integrationValue` | password input | optional | Secret value. Use `type="password"` with toggle button |
| `status` | select | required | `{ value: 1, label: 'Active' }`, `{ value: 0, label: 'Inactive' }` |

**Validation rules:**
- `integrationProviderId` is required
- `branchId` is required
- `status` is required (default to `1` in create mode)
- `integrationKey` and `integrationValue` are optional (backend allows null)

**Behavior:**
- Create mode: `branchId` pre-filled from page state, `integrationProviderId` editable dropdown
- Edit mode: `branchId` and `integrationProviderId` shown as read-only display fields (not select), `oid` sent in body
- In edit mode, load the existing setting via `getByBranchAndProvider(branchId, providerId)` when opening
- On submit create: call `POST /api/BranchIntegrationSetting`
- On submit edit: call `PUT /api/BranchIntegrationSetting/{id}`
- On success: `toast.success`, close modal, call `onSuccess()` to refresh table
- On failure: `toast.error(res.data.message)`

**Delete Behavior:**
- Open `ConfirmDialog`
- On confirm: call `DELETE /api/BranchIntegrationSetting/{id}`
- Check `res.data.data === true` (BooleanApiResponse)
- On success: `toast.success('Setting deleted')`, refresh table
- On false: `toast.error('Delete failed')`

#### Complete Component State

```tsx
// BranchIntegrationsPage.tsx — skeleton

const [branches, setBranches] = useState<BranchDto[]>([]);
const [providers, setProviders] = useState<IntegrationProviderDto[]>([]);
const [selectedBranchId, setSelectedBranchId] = useState<string>('');
const [settings, setSettings] = useState<BranchIntegrationSettingDto[]>([]);
const [isLoadingSettings, setIsLoadingSettings] = useState(false);
const [isModalOpen, setIsModalOpen] = useState(false);
const [editItem, setEditItem] = useState<BranchIntegrationSettingDto | null>(null);
const [deleteTarget, setDeleteTarget] = useState<string | null>(null);

// Load branches and providers on mount (parallel)
useEffect(() => {
  const init = async () => {
    const [branchRes, providerRes] = await Promise.all([
      branchService.getAll(),
      integrationProviderService.getAll(),
    ]);
    if (branchRes.data.success) setBranches(branchRes.data.data ?? []);
    if (providerRes.data.success) setProviders(providerRes.data.data ?? []);
  };
  init();
}, []);

// Load settings when branch changes
useEffect(() => {
  if (!selectedBranchId) { setSettings([]); return; }
  const load = async () => {
    setIsLoadingSettings(true);
    try {
      const res = await branchIntegrationSettingService.getByBranch(selectedBranchId);
      if (res.data.success) setSettings(res.data.data ?? []);
    } catch (e) { handleApiError(e); }
    finally { setIsLoadingSettings(false); }
  };
  load();
}, [selectedBranchId]);

const handleDelete = async () => {
  if (!deleteTarget) return;
  const res = await branchIntegrationSettingService.delete(deleteTarget);
  if (res.data.data === true) {           // BooleanApiResponse check
    toast.success('Setting deleted');
    // Re-fetch settings for current branch
    if (selectedBranchId) {
      const res2 = await branchIntegrationSettingService.getByBranch(selectedBranchId);
      if (res2.data.success) setSettings(res2.data.data ?? []);
    }
  } else {
    toast.error(res.data.message || 'Delete failed');
  }
  setDeleteTarget(null);
};
```

---

## 5. Routing — What to Add

In `src/App.tsx`, inside the existing protected `<Route path="/">` block, add:

```tsx
import IntegrationProvidersPage from '@/pages/integrations/IntegrationProvidersPage';
import BranchIntegrationsPage from '@/pages/integrations/BranchIntegrationsPage';

// Inside <Routes> → protected layout route:
<Route path="integrations/providers" element={<IntegrationProvidersPage />} />
<Route path="integrations/settings" element={<BranchIntegrationsPage />} />
```

No new top-level routes needed — both live under the existing protected layout.

---

## 6. Sidebar — What to Add

In `src/components/layout/Sidebar.tsx`, add a new nav section or group under an "Integrations" heading:

```
── Integrations ────────────────────
  Integration Providers   → /integrations/providers
  Branch Settings         → /integrations/settings
```

Use the same active-link styling already established (`bg-blue-700` or `text-blue-400`). Use these icons from `lucide-react`:
- Integration Providers → `<Plug />` or `<Cpu />`
- Branch Settings → `<Settings />` or `<SlidersHorizontal />`

---

## 7. Also: Updated Schemas for Existing Modules

The new Swagger spec reveals that several **existing** DTOs have gained new fields. The AI implementing this must also update the TypeScript interfaces and forms for those modules. These are not new pages — just schema updates.

### 7.1 BranchDto — New Fields

Add these to the existing `BranchDto` interface and to `CreateBranchDto` / `UpdateBranchDto`:

| Field | Type | Notes |
|-------|------|-------|
| `crn` | `string \| null` | Commercial Registration Number, max 20 |
| `vatNumber` | `string \| null` | VAT number, max 20 |
| `identifyLookupId` | `string \| null` | UUID — lookup for identification type |
| `identifyLookupName` | `string \| null` | (read: in Dto only) resolved name |
| `identifyValue` | `string \| null` | The actual identify value |
| `streetName` | `string \| null` | max 100 |
| `buildingNumber` | `string \| null` | max 10 |
| `citySubdivisionName` | `string \| null` | max 100 |
| `cityName` | `string \| null` | max 100 (separate from `city`) |
| `postalZone` | `string \| null` | max 10 — postal/ZIP code |
| `registrationName` | `string \| null` | max 200 |

> `BranchDto` no longer has `status`, `userCount`, or `stockCount` in the new spec. Remove those from the interface and table columns if they cause TypeScript errors.

**Form update:** Add a new "Legal & Regulatory" section to the Branch Form modal with: `crn`, `vatNumber`, `identifyLookupId` (select from AppLookup), `identifyValue`, `registrationName`, `vatNumber`.  
Add a new "Address Details" section with: `streetName`, `buildingNumber`, `citySubdivisionName`, `cityName`, `postalZone`.

### 7.2 ProductDto — New Fields

Add to `ProductDto`, `CreateProductDto`, and `UpdateProductDto`:

| Field | Type | Notes |
|-------|------|-------|
| `barcode` | `string \| null` | standard barcode |
| `drugNameAr` | `string \| null` | Arabic drug name |
| `vatTypeId` | `string \| null` | UUID — VAT type from lookup |
| `vatTypeName` | `string \| null` | (read only) |
| `vatTypeNameAr` | `string \| null` | (read only) |
| `packageTypeId` | `string \| null` | UUID — package type lookup |
| `packageTypeName` | `string \| null` | (read only) |
| `packageTypeNameAr` | `string \| null` | (read only) |
| `dosageFormId` | `string \| null` | UUID — dosage form lookup |
| `dosageFormName` | `string \| null` | (read only) |
| `dosageFormNameAr` | `string \| null` | (read only) |
| `productGroupId` | `string \| null` | UUID — product group lookup |
| `productGroupName` | `string \| null` | (read only) |
| `productGroupNameAr` | `string \| null` | (read only) |
| `productTypeNameAr` | `string \| null` | (read only — Arabic name of product type) |
| `updatedAt` | `string \| null` | datetime |

**Form update:** Add to the Product Form:
- `barcode` in Basic Info section
- `drugNameAr` next to `drugName`
- `vatTypeId` select (from AppLookup `VAT_TYPE`)
- `packageTypeId` select (from AppLookup `PACKAGE_TYPE` — replaces or supplements the existing free-text `packageType`)
- `dosageFormId` select (from AppLookup `DOSAGE_FORM`)
- `productGroupId` select (from AppLookup `PRODUCT_GROUP`)

### 7.3 SystemUserDto — New Fields

Add to the existing `SystemUserDto` interface (read-only display fields, not sent in create/update):

| Field | Type | Notes |
|-------|------|-------|
| `genderLookupId` | `string \| null` | UUID (already in create/update DTOs) |
| `genderName` | `string \| null` | Resolved display name |
| `roleName` | `string \| null` | Resolved role name (no longer need separate join) |
| `lastLogin` | `string \| null` | Last login datetime |
| `failedLoginCount` | `number` | Count of failed logins |
| `lockoutEnd` | `string \| null` | Lockout expiry datetime |
| `passwordExpiry` | `string \| null` | When password expires |
| `updatedAt` | `string \| null` | |

**Table update:** Add `lastLogin`, `roleName` (use this instead of joining with role list), and `failedLoginCount` columns to the Users page table.

### 7.4 AppLookup — Updated & New Endpoints

The lookup service has new cleaner endpoint paths AND full CRUD for both masters and details. Update `src/api/lookupService.ts`:

```ts
import api from './axios';
import {
  ApiResponse, BooleanApiResponse,
  AppLookupMasterDto, AppLookupDetailDto,
  CreateAppLookupMasterDto, UpdateAppLookupMasterDto,
  CreateAppLookupDetailDto, UpdateAppLookupDetailDto,
  PagedResult, QueryRequest
} from '@/types';

export const lookupService = {
  // ── Master ────────────────────────────────────────────────────────────────

  query: (req: QueryRequest) =>
    api.post<ApiResponse<PagedResult<AppLookupMasterDto>>>('/api/AppLookup/query', req),

  // Get by UUID (new preferred endpoint)
  getById: (id: string, includeDetails = true) =>
    api.get<ApiResponse<AppLookupMasterDto>>(
      `/api/AppLookup/masters/${id}`, { params: { includeDetails } }
    ),

  // Get by lookup code (new clean URL)
  getByCode: (lookupCode: string, includeDetails = true) =>
    api.get<ApiResponse<AppLookupMasterDto>>(
      `/api/AppLookup/masters/code/${lookupCode}`, { params: { includeDetails } }
    ),

  createMaster: (dto: CreateAppLookupMasterDto) =>
    api.post<ApiResponse<AppLookupMasterDto>>('/api/AppLookup/masters', dto),

  // NEW — update master
  updateMaster: (id: string, dto: UpdateAppLookupMasterDto) =>
    api.put<ApiResponse<AppLookupMasterDto>>(`/api/AppLookup/masters/${id}`, dto),

  // NEW — delete master
  deleteMaster: (id: string) =>
    api.delete<BooleanApiResponse>(`/api/AppLookup/masters/${id}`),

  // ── Details ───────────────────────────────────────────────────────────────

  // Get details by master UUID (new clean URL)
  getDetails: (masterId: string) =>
    api.get<ApiResponse<AppLookupDetailDto[]>>(
      `/api/AppLookup/masters/${masterId}/details`
    ),

  createDetail: (dto: CreateAppLookupDetailDto) =>
    api.post<ApiResponse<AppLookupDetailDto>>('/api/AppLookup/details', dto),

  // NEW — update detail
  updateDetail: (id: string, dto: UpdateAppLookupDetailDto) =>
    api.put<ApiResponse<AppLookupDetailDto>>(`/api/AppLookup/details/${id}`, dto),

  // NEW — delete detail
  deleteDetail: (id: string) =>
    api.delete<BooleanApiResponse>(`/api/AppLookup/details/${id}`),
};
```

**Also add these two interfaces to `src/types/index.ts`:**

```ts
export interface UpdateAppLookupMasterDto {
  oid: string;              // required
  lookupCode: string;       // required, max 50
  lookupNameAr: string;     // required, max 100
  lookupNameEn: string;     // required, max 100
  description?: string;     // max 250
  isSystem: boolean;
}

export interface UpdateAppLookupDetailDto {
  oid: string;              // required
  lookupMasterID: string;   // required
  valueCode: string;        // required, max 50
  valueNameAr: string;      // required, max 100
  valueNameEn: string;      // required, max 100
  sortOrder?: number;       // min 1
  isDefault: boolean;
  isActive: boolean;        // NEW field — not in old spec
}
```

**Lookup Detail Page update:** Now that details have Edit and Delete, update `LookupDetailPage.tsx`:
- Table rows now have Edit icon (open `UpdateAppLookupDetailDto` form) and Delete icon (confirm → `deleteDetail(id)`)
- Master header card shows Edit button → opens `UpdateAppLookupMasterDto` form
- Master card shows Delete button → `deleteMaster(id)` then navigate back to `/lookups`
- `isActive` field added to detail form

---

## Summary of All New & Changed Files

### New files to create:
```
src/api/integrationProviderService.ts
src/api/branchIntegrationSettingService.ts
src/pages/integrations/IntegrationProvidersPage.tsx
src/pages/integrations/IntegrationProviderForm.tsx
src/pages/integrations/BranchIntegrationsPage.tsx
src/pages/integrations/BranchIntegrationForm.tsx
```

### Existing files to modify:
```
src/types/index.ts                        ← Add 6 new interfaces, update 3 existing
src/App.tsx                               ← Add 2 new routes
src/components/layout/Sidebar.tsx         ← Add Integrations nav group
src/api/lookupService.ts                  ← Replace with full CRUD version
src/pages/lookups/LookupDetailPage.tsx    ← Add Edit/Delete for masters and details
src/pages/branches/BranchForm.tsx         ← Add new Branch fields
src/pages/products/ProductForm.tsx        ← Add new Product fields
src/pages/users/UsersPage.tsx             ← Add new columns (roleName, lastLogin)
```

---

*End of Integration Add-On SOP. Hand this document together with the original SOP to the AI agent building the app.*
