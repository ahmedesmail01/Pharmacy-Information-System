import { useTranslation } from "react-i18next";
import { User as UserIcon, Phone, MapPin } from "lucide-react";
import { SalesInvoiceDto } from "@/types";

interface InvoiceInfoGridProps {
  invoice: SalesInvoiceDto;
}

export default function InvoiceInfoGrid({ invoice }: InvoiceInfoGridProps) {
  const { t } = useTranslation("sales");

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 p-6 bg-gray-50/50 rounded-2xl border border-gray-100/50">
      <div className="space-y-4">
        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
          <UserIcon className="h-4 w-4" />
          {t("bill_to")}
        </h3>
        <div className="space-y-1">
          <p className="font-bold text-gray-900 text-lg">
            {invoice.customerName || t("walk_in_customer")}
          </p>
          {invoice.customerPhone && (
            <p className="text-sm text-gray-500 flex items-center gap-2">
              <Phone className="h-3.5 w-3.5" />
              {invoice.customerPhone}
            </p>
          )}
        </div>
      </div>

      <div className="space-y-4 sm:text-right">
        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center sm:justify-end gap-2">
          <MapPin className="h-4 w-4" />
          {t("branch_info")}
        </h3>
        <div className="space-y-1">
          <p className="font-bold text-gray-900 text-lg">
            {invoice.branchName}
          </p>
          <p className="text-sm text-gray-500">
            {t("cashier")}:{" "}
            <span className="font-medium text-gray-700">
              {invoice.createdByName || "---"}
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}
