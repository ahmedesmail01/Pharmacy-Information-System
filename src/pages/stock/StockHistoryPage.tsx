import { useTranslation } from "react-i18next";
import PageHeader from "@/components/shared/PageHeader";
import StockTransactions from "./StockTransactions";

export default function StockHistoryPage() {
  const { t } = useTranslation("stock");

  return (
    <div className="space-y-6 max-w-full mx-auto pb-10">
      <PageHeader
        title={t("transaction_history", {
          defaultValue: "Transaction History",
        })}
      />
      <StockTransactions />
    </div>
  );
}
