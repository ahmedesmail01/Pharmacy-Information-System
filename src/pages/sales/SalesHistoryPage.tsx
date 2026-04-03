import { useTranslation } from "react-i18next";
import PageHeader from "@/components/shared/PageHeader";
import SalesHistory from "./components/SalesHistory";

export default function SalesHistoryPage() {
  const { t } = useTranslation("sales");

  return (
    <div className="space-y-1">
      <PageHeader title={t("sales_history", { defaultValue: "Sales History" })} />
      <SalesHistory />
    </div>
  );
}
