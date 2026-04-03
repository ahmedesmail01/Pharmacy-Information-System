import { useTranslation } from "react-i18next";
import PageHeader from "@/components/shared/PageHeader";
import StockLevels from "./StockLevels";

export default function StockLevelsPage() {
  const { t } = useTranslation("stock");

  return (
    <div className="space-y-6 max-w-full mx-auto pb-10">
      <PageHeader
        title={t("stock_levels", { defaultValue: "Stock Levels" })}
      />
      <StockLevels />
    </div>
  );
}
