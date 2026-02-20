import PageHeader from "@/components/shared/PageHeader";
import StockTransactions from "./StockTransactions";

export default function StockTransactionsPage() {
  return (
    <div className="space-y-6">
      <PageHeader title="Stock Transactions History" />
      <StockTransactions />
    </div>
  );
}
