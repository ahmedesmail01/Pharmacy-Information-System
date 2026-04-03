import { useTranslation } from "react-i18next";
import PageHeader from "@/components/shared/PageHeader";
import RefundHistory from "./components/RefundHistory";

export default function RefundHistoryPage() {
  const { t } = useTranslation("sales");

  return (
    <div className="space-y-1">
      <PageHeader
        title={t("refund_history", { defaultValue: "Refund History" })}
      />
      <RefundHistory />
    </div>
  );
}
