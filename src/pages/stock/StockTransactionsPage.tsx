import PageHeader from "@/components/shared/PageHeader";
import { useTranslation } from "react-i18next";
import StockTransactions from "./StockTransactions";

export default function StockTransactionsPage() {
  const { t } = useTranslation("stock");
  return (
    <div className="space-y-6">
      <PageHeader title={t("transaction_history")} />
      <StockTransactions />
    </div>
  );
}
