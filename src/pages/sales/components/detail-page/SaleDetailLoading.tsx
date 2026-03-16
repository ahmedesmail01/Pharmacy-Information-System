import { useTranslation } from "react-i18next";
import Spinner from "@/components/ui/Spinner";

export default function SaleDetailLoading() {
  const { t } = useTranslation("sales");
  return (
    <div className="h-[60vh] flex flex-col items-center justify-center gap-4 text-primary-600">
      <Spinner size="lg" />
      <p className="text-gray-500 font-medium animate-pulse">
        {t("fetching_invoice")}
      </p>
    </div>
  );
}
