import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  MapPin,
  Package,
  ShoppingCart,
  Database,
  Users,
  ShieldCheck,
  Search,
  ChevronDown,
  ChevronRight,
  UserCircle,
  Settings,
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
];

export default function Sidebar() {
  const location = useLocation();
  const [openSubmenu, setOpenSubmenu] = useState<string | null>(null);

  const isActive = (path: string) => {
    if (path === "/") return location.pathname === "/";
    return location.pathname.startsWith(path);
  };

  const toggleSubmenu = (label: string) => {
    setOpenSubmenu(openSubmenu === label ? null : label);
  };

  return (
    <aside className="w-64 bg-gray-900 text-white h-screen fixed left-0 top-0 z-40 flex flex-col">
      <div className="p-6">
        <h2 className="text-xl font-bold tracking-tight text-blue-400">
          Pharmacy IS
        </h2>
      </div>

      <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto no-scrollbar">
        {menuItems.map((item) => (
          <div key={item.label}>
            {item.children ? (
              <>
                <button
                  onClick={() => toggleSubmenu(item.label)}
                  className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-colors ${
                    isActive(item.path)
                      ? "bg-blue-600 text-white"
                      : "hover:bg-gray-800 text-gray-400"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <item.icon className="h-5 w-5" />
                    <span className="font-medium">{item.label}</span>
                  </div>
                  {openSubmenu === item.label ? (
                    <ChevronDown className="h-4 w-4" />
                  ) : (
                    <ChevronRight className="h-4 w-4" />
                  )}
                </button>
                {openSubmenu === item.label && (
                  <div className="ml-12 mt-1 space-y-1">
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
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${
                  isActive(item.path)
                    ? "bg-blue-600 text-white"
                    : "hover:bg-gray-800 text-gray-400"
                }`}
              >
                <item.icon className="h-5 w-5" />
                <span className="font-medium">{item.label}</span>
              </Link>
            )}
          </div>
        ))}
      </nav>

      <div className="p-6 border-t border-gray-800">
        <div className="text-xs text-gray-500 uppercase tracking-widest font-semibold mb-2 px-4">
          Version
        </div>
        <div className="px-4 text-sm text-gray-400 font-medium">v1.0.0</div>
      </div>
    </aside>
  );
}
