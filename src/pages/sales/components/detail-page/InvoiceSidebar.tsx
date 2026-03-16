import { CreditCard, CheckCircle2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import Card from "@/components/ui/Card";
import { SalesInvoiceDto } from "@/types";

interface InvoiceSidebarProps {
  invoice: SalesInvoiceDto;
}

export default function InvoiceSidebar({ invoice }: InvoiceSidebarProps) {
  const { t } = useTranslation("sales");

  return (
    <div className="space-y-6 print:hidden">
      <Card
        title="Payment Details"
        className="border border-gray-100 shadow-md shadow-gray-100/50 bg-white"
      >
        <div className="space-y-6 p-2">
          <div className="flex flex-col gap-1">
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
              Payment Method
            </span>
            <div className="flex items-center gap-3 bg-gray-50 p-3 rounded-xl border border-gray-100/50">
              <div className="p-2 bg-white rounded-lg shadow-sm">
                <CreditCard className="h-5 w-5 text-slate-600" />
              </div>
              <span className="font-bold text-gray-800">
                {invoice.paymentMethodName || t("cash")}
              </span>
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
              Transaction Status
            </span>
            <div className="flex items-center gap-3 bg-emerald-50 text-emerald-700 p-3 rounded-xl border border-emerald-100">
              <div className="p-2 bg-emerald-100 rounded-lg">
                <CheckCircle2 className="h-5 w-5 text-emerald-600" />
              </div>
              <div>
                <span className="font-bold block">{t("settled")}</span>
                <span className="text-xs opacity-80 block">
                  Processed successfully
                </span>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
