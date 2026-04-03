import { useTranslation } from "react-i18next";
import PageHeader from "@/components/shared/PageHeader";
import StockTransactionReturns from "./StockTransactionReturns";

export default function StockReturnsPage() {
  const { t } = useTranslation("stock");

  return (
    <div className="space-y-6 max-w-full mx-auto pb-10">
      <PageHeader
        title={t("transaction_returns", { defaultValue: "Returns" })}
      />
      <StockTransactionReturns />
    </div>
  );
}
