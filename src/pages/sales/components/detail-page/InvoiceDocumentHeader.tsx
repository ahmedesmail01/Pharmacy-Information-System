import { useTranslation } from "react-i18next";
import { format } from "date-fns";
import { Receipt, CheckCircle2, Calendar } from "lucide-react";
import clsx from "clsx";
import { SalesInvoiceDto } from "@/types";

interface InvoiceDocumentHeaderProps {
  invoice: SalesInvoiceDto;
}

export default function InvoiceDocumentHeader({
  invoice,
}: InvoiceDocumentHeaderProps) {
  const { t } = useTranslation("sales");
  const tc = useTranslation("common").t;

  return (
    <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 p-8 sm:p-10 text-white relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute top-0 right-0 -translate-y-1/4 translate-x-1/4 opacity-10 blur-2xl">
        <div className="w-64 h-64 bg-white rounded-full"></div>
      </div>
      <div className="absolute bottom-0 left-0 translate-y-1/2 -translate-x-1/4 opacity-10 blur-2xl">
        <div className="w-48 h-48 bg-white rounded-full"></div>
      </div>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 relative z-10">
        <div className="space-y-4">
          <div className="inline-flex items-center justify-center p-3 bg-white/10 rounded-xl backdrop-blur-sm mb-2">
            <Receipt className="h-8 w-8 text-blue-300" />
          </div>
          <div>
            <h1 className="text-4xl font-black tracking-tight text-white mb-2">
              {tc("invoice").toUpperCase()}
            </h1>
            <div className="flex items-center gap-3 text-slate-300">
              <span className="font-mono text-lg bg-white/10 px-3 py-1 rounded-md backdrop-blur-sm border border-white/5">
                #{invoice.invoiceNumber}
              </span>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-3 text-left md:text-right shrink-0">
          <div
            className={clsx(
              "inline-flex items-center gap-2 px-4 py-2 rounded-full font-medium text-sm self-start md:self-end border backdrop-blur-md shadow-sm",
              invoice.invoiceStatusName === "Paid" ||
                invoice.invoiceStatusName === "مدفوعة"
                ? "bg-emerald-500/20 text-emerald-100 border-emerald-500/30"
                : "bg-amber-500/20 text-amber-100 border-amber-500/30",
            )}
          >
            <CheckCircle2 className="h-4 w-4" />
            {invoice.invoiceStatusName}
          </div>
          <div className="text-slate-300 space-y-1 text-sm mt-2">
            <div className="flex items-center justify-start md:justify-end gap-2">
              <Calendar className="h-4 w-4 opacity-70" />
              <span>
                {invoice.invoiceDate
                  ? format(
                      new Date(invoice.invoiceDate),
                      "MMM dd, yyyy • HH:mm",
                    )
                  : "---"}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
