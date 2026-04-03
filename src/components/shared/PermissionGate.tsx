import type { ReactNode } from "react";
import { usePermissions } from "@/hooks/usePermissions";
import type { Permission } from "@/config/permissions";
import AccessDenied from "./AccessDenied";

interface PermissionGateProps {
  /** Single permission required */
  permission?: Permission | string;
  /** Multiple permissions — user must have ANY of them */
  anyOf?: (Permission | string)[];
  /** Multiple permissions — user must have ALL of them */
  allOf?: (Permission | string)[];
  /** Content to render when access is granted */
  children: ReactNode;
  /** Content to render when access is denied (defaults to <AccessDenied />) */
  fallback?: ReactNode;
  /** If true, renders nothing instead of the fallback when denied */
  silent?: boolean;
}

/**
 * Conditionally renders children based on user permissions.
 *
 * Usage:
 * ```tsx
 * <PermissionGate permission={PERMISSIONS.SALES.CREATE}>
 *   <SaleForm />
 * </PermissionGate>
 *
 * <PermissionGate anyOf={[PERMISSIONS.SALES.VIEW, PERMISSIONS.SALES.HISTORY]}>
 *   <SalesHistory />
 * </PermissionGate>
 *
 * <PermissionGate permission={PERMISSIONS.PRODUCTS.DELETE} silent>
 *   <DeleteButton />
 * </PermissionGate>
 * ```
 */
export default function PermissionGate({
  permission,
  anyOf,
  allOf,
  children,
  fallback,
  silent = false,
}: PermissionGateProps) {
  const { hasPermission, hasAnyPermission, hasAllPermissions } =
    usePermissions();

  let granted = true;

  if (permission) {
    granted = hasPermission(permission);
  } else if (anyOf && anyOf.length > 0) {
    granted = hasAnyPermission(...anyOf);
  } else if (allOf && allOf.length > 0) {
    granted = hasAllPermissions(...allOf);
  }

  if (granted) {
    return <>{children}</>;
  }

  if (silent) {
    return null;
  }

  return <>{fallback ?? <AccessDenied />}</>;
}
