import { LogOut, User, Bell, Menu, Globe } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useTranslation } from "react-i18next";
import Button from "../ui/Button";

interface TopbarProps {
  onMenuClick: () => void;
}

export default function Topbar({ onMenuClick }: TopbarProps) {
  const { user, logout } = useAuth();
  const { t, i18n } = useTranslation();

  const toggleLanguage = () => {
    const next = i18n.language === "ar" ? "en" : "ar";
    i18n.changeLanguage(next);
  };

  return (
    <header className="h-16 bg-white border-b border-gray-100 flex items-center justify-between px-4 md:px-8 sticky top-0 z-30">
      <div className="flex items-center gap-4">
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 -ml-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <Menu className="h-6 w-6" />
        </button>
      </div>

      <div className="flex items-center gap-3 md:gap-6">
        {/* Language Toggle */}
        <button
          onClick={toggleLanguage}
          className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-bold rounded-lg border border-gray-200 bg-gray-50 hover:bg-gray-100 text-gray-700 transition-colors"
          title={
            i18n.language === "ar" ? "Switch to English" : "التبديل للعربية"
          }
        >
          <Globe className="h-4 w-4" />
          <span>{i18n.language === "ar" ? "EN" : "AR"}</span>
        </button>

        <button className="text-gray-400 hover:text-gray-600 transition-colors relative">
          <Bell className="h-5 w-5" />
          <span className="absolute top-0 right-0 h-2 w-2 bg-red-500 rounded-full border-2 border-white"></span>
        </button>

        <div className="h-8 w-px bg-gray-100 mx-1 md:mx-2"></div>

        <div className="flex items-center gap-2 md:gap-4">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-semibold text-gray-900 truncate max-w-[150px]">
              {user?.fullName || user?.username}
            </p>
            <p className="text-xs text-gray-500 font-medium">
              {t("common:admin")}
            </p>
          </div>
          <div className="h-9 w-9 md:h-10 md:w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
            <User className="h-5 w-5 md:h-6 md:w-6" />
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={logout}
            className="text-gray-500 hover:text-red-600 hover:bg-red-50 p-2"
          >
            <LogOut className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </header>
  );
}
