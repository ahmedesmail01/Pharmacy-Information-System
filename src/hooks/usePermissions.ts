import { useMemo } from "react";
import { ALL_PERMISSIONS, type Permission } from "@/config/permissions";
// import { useAuthStore } from "@/store/authStore";

// ─── How to integrate with the backend ──────────────────────────────────────
//
// When the backend is ready (e.g. GET /api/permissions/me returns string[]):
//
// 1. Create an API service:
//      export const permissionService = {
//        getMyPermissions: () => api.get<ApiResponse<string[]>>("/api/permissions/me"),
//      };
//
// 2. Create a React Query hook:
//      export function useMyPermissions() {
//        return useQuery({ queryKey: ["my-permissions"], queryFn: permissionService.getMyPermissions });
//      }
//
// 3. In this file, replace `ALL_PERMISSIONS` with the query result:
//      const { data } = useMyPermissions();
//      const grantedPermissions = data?.data?.data ?? [];
//
// 4. Everything else (PermissionGate, sidebar filtering, route guards)
//    will automatically work — no other changes needed.
// ────────────────────────────────────────────────────────────────────────────

export function usePermissions() {
  // ┌──────────────────────────────────────────────────────────────────────┐
  // │  TEMPORARY: Grant ALL permissions until backend is ready.           │
  // │  Replace `ALL_PERMISSIONS` with real permissions from the API.      │
  // └──────────────────────────────────────────────────────────────────────┘
  const grantedPermissions = useMemo(() => new Set<string>(ALL_PERMISSIONS), []);

  /** Check if the user has a specific permission */
  const hasPermission = (permission: Permission | string): boolean => {
    return grantedPermissions.has(permission);
  };

  /** Check if the user has ANY of the given permissions */
  const hasAnyPermission = (...permissions: (Permission | string)[]): boolean => {
    return permissions.some((p) => grantedPermissions.has(p));
  };

  /** Check if the user has ALL of the given permissions */
  const hasAllPermissions = (...permissions: (Permission | string)[]): boolean => {
    return permissions.every((p) => grantedPermissions.has(p));
  };

  return {
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    permissions: grantedPermissions,
  };
}
