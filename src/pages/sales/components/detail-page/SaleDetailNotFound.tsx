import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { ArrowLeft, FileText } from "lucide-react";
import Button from "@/components/ui/Button";

export default function SaleDetailNotFound() {
  const { t } = useTranslation("sales");
  return (
    <div className="flex flex-col items-center justify-center h-[60vh] text-center space-y-6">
      <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mb-4">
        <FileText className="h-10 w-10 text-gray-300" />
      </div>
      <div className="space-y-2">
        <h2 className="text-2xl font-bold text-gray-800">
          {t("invoice_not_found")}
        </h2>
        <p className="text-gray-500 max-w-sm mx-auto">
          The invoice you are looking for does not exist or has been removed.
        </p>
      </div>
      <Link to="/sales">
        <Button variant="primary" className="gap-2 shadow-md">
          <ArrowLeft className="h-4 w-4 rtl:rotate-180" />
          {t("back_to_sales")}
        </Button>
      </Link>
    </div>
  );
}
