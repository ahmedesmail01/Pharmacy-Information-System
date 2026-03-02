import { ShoppingCart, History } from "lucide-react";
import { useTranslation } from "react-i18next";

interface SalesTabsProps {
  activeTab: "form" | "history";
  setActiveTab: (tab: "form" | "history") => void;
}

export default function SalesTabs({ activeTab, setActiveTab }: SalesTabsProps) {
  const { t } = useTranslation("sales");

  return (
    <div className="flex items-center gap-2 p-1 bg-gray-100 rounded-2xl w-fit max-w-full overflow-x-auto no-scrollbar">
      <button
        onClick={() => setActiveTab("form")}
        className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${
          activeTab === "form"
            ? "bg-white text-blue-600 shadow-sm"
            : "text-gray-500 hover:text-gray-700"
        }`}
      >
        <ShoppingCart className="h-4 w-4" />
        {t("sales_form", { defaultValue: "Sales Form" })}
      </button>
      <button
        onClick={() => setActiveTab("history")}
        className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${
          activeTab === "history"
            ? "bg-white text-blue-600 shadow-sm"
            : "text-gray-500 hover:text-gray-700"
        }`}
      >
        <History className="h-4 w-4" />
        {t("sales_history", { defaultValue: "Sales History" })}
      </button>
    </div>
  );
}
