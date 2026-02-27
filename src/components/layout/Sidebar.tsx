import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  MapPin,
  Package,
  ShoppingCart,
  Database,
  Users,
  ShieldCheck,
  ChevronDown,
  ChevronRight,
  UserCircle,
  Settings,
  ChevronLeft,
  ChevronRight as ChevronRightIcon,
  Menu,
  Plug,
  SlidersHorizontal,
} from "lucide-react";
import { useState } from "react";

const menuItems = [
  { label: "Dashboard", icon: LayoutDashboard, path: "/" },
  { label: "Branches", icon: MapPin, path: "/branches" },
  { label: "Products", icon: Package, path: "/products" },
  { label: "Sales", icon: ShoppingCart, path: "/sales" },
  {
    label: "Stock",
    icon: Database,
    path: "/stock",
    children: [
      { label: "Stock Levels", path: "/stock" },
      { label: "Transactions", path: "/stock/transactions" },
    ],
  },
  { label: "Stakeholders", icon: UserCircle, path: "/stakeholders" },
  { label: "System Users", icon: Users, path: "/users" },
  { label: "Roles", icon: ShieldCheck, path: "/roles" },
  { label: "Lookups", icon: Settings, path: "/lookups" },
  {
    label: "Integrations",
    icon: Plug,
    path: "/integrations",
    children: [
      { label: "Providers", path: "/integrations/providers" },
      { label: "Branch Settings", path: "/integrations/settings" },
    ],
  },
];

interface SidebarProps {
  isCollapsed: boolean;
  setIsCollapsed: (value: boolean) => void;
  isMobileOpen: boolean;
}

export default function Sidebar({
  isCollapsed,
  setIsCollapsed,
  isMobileOpen,
}: SidebarProps) {
  const location = useLocation();
  const [openSubmenu, setOpenSubmenu] = useState<string | null>(null);

  const isActive = (path: string) => {
    if (path === "/") return location.pathname === "/";
    return location.pathname.startsWith(path);
  };

  const toggleSubmenu = (label: string) => {
    if (isCollapsed) {
      setIsCollapsed(false);
      setOpenSubmenu(label);
    } else {
      setOpenSubmenu(openSubmenu === label ? null : label);
    }
  };

  return (
    <aside
      className={`bg-gray-900 text-white h-screen fixed left-0 top-0 z-40 flex flex-col transition-all duration-300 ${
        isMobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
      } ${isCollapsed ? "w-20" : "w-64"}`}
    >
      <div className="p-6 flex items-center justify-between overflow-hidden">
        {!isCollapsed && (
          <h2 className="text-xl font-bold tracking-tight text-blue-400 truncate">
            Pharmacy IS
          </h2>
        )}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="hidden lg:flex h-8 w-8 items-center justify-center rounded-lg hover:bg-gray-800 text-gray-400 transition-colors ml-auto"
        >
          {isCollapsed ? (
            <ChevronRightIcon className="h-5 w-5" />
          ) : (
            <ChevronLeft className="h-5 w-5" />
          )}
        </button>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto no-scrollbar overflow-x-hidden">
        {menuItems.map((item) => (
          <div key={item.label}>
            {item.children ? (
              <>
                <button
                  onClick={() => toggleSubmenu(item.label)}
                  className={`w-full flex items-center justify-between px-3 py-3 rounded-xl transition-colors ${
                    isActive(item.path)
                      ? "bg-blue-600 text-white"
                      : "hover:bg-gray-800 text-gray-400"
                  }`}
                  title={isCollapsed ? item.label : ""}
                >
                  <div className="flex items-center gap-3">
                    <item.icon className="h-5 w-5 min-w-[20px]" />
                    {!isCollapsed && (
                      <span className="font-medium whitespace-nowrap">
                        {item.label}
                      </span>
                    )}
                  </div>
                  {!isCollapsed &&
                    (openSubmenu === item.label ? (
                      <ChevronDown className="h-4 w-4" />
                    ) : (
                      <ChevronRight className="h-4 w-4" />
                    ))}
                </button>
                {openSubmenu === item.label && !isCollapsed && (
                  <div className="ml-10 mt-1 space-y-1 transition-all">
                    {item.children.map((child) => (
                      <Link
                        key={child.path}
                        to={child.path}
                        className={`block px-4 py-2 rounded-lg text-sm transition-colors ${
                          location.pathname === child.path
                            ? "text-white"
                            : "text-gray-500 hover:text-white"
                        }`}
                      >
                        {child.label}
                      </Link>
                    ))}
                  </div>
                )}
              </>
            ) : (
              <Link
                to={item.path}
                className={`flex items-center gap-3 px-3 py-3 rounded-xl transition-colors ${
                  isActive(item.path)
                    ? "bg-blue-600 text-white"
                    : "hover:bg-gray-800 text-gray-400"
                }`}
                title={isCollapsed ? item.label : ""}
              >
                <item.icon className="h-5 w-5 min-w-[20px]" />
                {!isCollapsed && (
                  <span className="font-medium whitespace-nowrap">
                    {item.label}
                  </span>
                )}
              </Link>
            )}
          </div>
        ))}
      </nav>

      <div className="p-6 border-t border-gray-800 flex flex-col items-center">
        {!isCollapsed && (
          <div className="w-full">
            <div className="text-xs text-gray-500 uppercase tracking-widest font-semibold mb-2 px-1">
              Version
            </div>
            <div className="px-1 text-sm text-gray-400 font-medium">v1.0.0</div>
          </div>
        )}
        {isCollapsed && (
          <div className="text-[10px] text-gray-600 font-bold">V1.0</div>
        )}
      </div>
    </aside>
  );
}
