import { useEffect, useState, useRef, useCallback } from "react";
import { useParams, Link } from "react-router-dom";
import {
  ArrowLeft,
  Printer,
  FileText,
  MapPin,
  Calendar,
  CreditCard,
  User as UserIcon,
  Phone,
  Receipt,
  CheckCircle2,
  Undo2,
} from "lucide-react";
import { format } from "date-fns";
import { useTranslation } from "react-i18next";
import { useReactToPrint } from "react-to-print";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import Spinner from "@/components/ui/Spinner";
import { salesService } from "@/api/salesService";
import { SalesInvoiceDto } from "@/types";
import { handleApiError } from "@/utils/handleApiError";
import clsx from "clsx";
import ReturnInvoiceModal from "./components/ReturnInvoiceModal";

export default function SaleDetailPage() {
  const { t } = useTranslation("sales");
  const tc = useTranslation("common").t;
  const { id } = useParams();
  const [invoice, setInvoice] = useState<SalesInvoiceDto | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isReturnModalOpen, setIsReturnModalOpen] = useState(false);

  // Reference for react-to-print
  const componentRef = useRef<HTMLDivElement>(null);
  const handlePrint = useReactToPrint({
    contentRef: componentRef,
    documentTitle: `Invoice_${invoice?.invoiceNumber || id}`,
  });

  const fetchInvoice = useCallback(async () => {
    if (!id) return;
    try {
      const res = await salesService.getById(id);
      setInvoice(res.data.data);
    } catch (err) {
      handleApiError(err);
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchInvoice();
  }, [fetchInvoice]);

  if (isLoading) {
    return (
      <div className="h-[60vh] flex flex-col items-center justify-center gap-4 text-primary-600">
        <Spinner size="lg" />
        <p className="text-gray-500 font-medium animate-pulse">
          {t("fetching_invoice")}
        </p>
      </div>
    );
  }

  if (!invoice) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-center space-y-6">
        <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mb-4">
          <FileText className="h-10 w-10 text-gray-300" />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-gray-800">
            {t("invoice_not_found")}
          </h2>
          <p className="text-gray-500 max-w-sm mx-auto">
            The invoice you are looking for does not exist or has been removed.
          </p>
        </div>
        <Link to="/sales">
          <Button variant="primary" className="gap-2 shadow-md">
            <ArrowLeft className="h-4 w-4 rtl:rotate-180" />
            {t("back_to_sales")}
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header Actions */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white/50 backdrop-blur-sm p-4 rounded-2xl border border-gray-100">
        <Link to="/sales">
          <Button
            variant="ghost"
            className="gap-2 text-gray-600 hover:text-gray-900 hover:bg-white transition-all"
          >
            <ArrowLeft className="h-4 w-4 rtl:rotate-180" />
            {t("back_to_sales")}
          </Button>
        </Link>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <Button
            onClick={() => setIsReturnModalOpen(true)}
            variant="ghost"
            className="gap-2 text-primary-600 hover:text-primary-700 hover:bg-primary-50 transition-all"
          >
            <Undo2 className="h-4 w-4" />
            {t("return_items")}
          </Button>
          <Button
            onClick={() => handlePrint()}
            variant="primary"
            className="gap-2 shadow-lg shadow-primary-600/20 w-full sm:w-auto transition-all hover:-translate-y-0.5"
          >
            <Printer className="h-4 w-4" />
            {t("print_invoice")}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* Main Invoice Document */}
        <div className="xl:col-span-2">
          <Card
            ref={componentRef}
            className="overflow-hidden border-none shadow-2xl shadow-gray-200/50 bg-white print:shadow-none print:w-full"
          >
            {/* Invoice Header Ribbon */}
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

            <div className="p-8 sm:p-10 space-y-10">
              {/* Info Grid */}
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

              {/* Items Table */}
              <div className="rounded-2xl border border-gray-100 overflow-hidden bg-white shadow-sm">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left">
                    <thead className="bg-gray-50/80 text-gray-500 font-medium uppercase text-xs tracking-wider border-b border-gray-100">
                      <tr>
                        <th className="px-6 py-4">{t("product")}</th>
                        <th className="px-6 py-4 text-center">{t("qty")}</th>
                        <th className="px-6 py-4 text-right">
                          {t("unit_price")}
                        </th>
                        <th className="px-6 py-4 text-right">{t("total")}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {invoice.items?.map((item, idx) => (
                        <tr
                          key={idx}
                          className="hover:bg-gray-50/50 transition-colors group"
                        >
                          <td className="px-6 py-4">
                            <p className="font-bold text-gray-900 group-hover:text-primary-700 transition-colors">
                              {item.productName}
                            </p>
                            <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
                              {item.batchNumber && (
                                <span className="bg-gray-100 px-2 py-0.5 rounded font-mono">
                                  {t("batch")}: {item.batchNumber}
                                </span>
                              )}
                              {item.productGTIN && (
                                <span className="text-gray-400">
                                  GTIN: {item.productGTIN}
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4 text-center font-medium text-gray-700">
                            {item.quantity}
                          </td>
                          <td className="px-6 py-4 text-right font-medium text-gray-600">
                            ${item.unitPrice?.toFixed(2)}
                          </td>
                          <td className="px-6 py-4 text-right font-bold text-gray-900">
                            $
                            {(item.quantity * (item.unitPrice || 0)).toFixed(2)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Totals Section */}
                <div className="bg-gray-50/50 p-6 md:p-8 flex flex-col items-end border-t border-gray-100">
                  <div className="w-full max-w-sm space-y-4">
                    <div className="flex justify-between text-sm text-gray-600">
                      <span>{t("subtotal")}</span>
                      <span className="font-semibold text-gray-900">
                        $
                        {(
                          (invoice.totalAmount || 0) - (invoice.taxAmount || 0)
                        ).toFixed(2)}
                      </span>
                    </div>
                    {invoice.taxAmount ? (
                      <div className="flex justify-between text-sm text-gray-600">
                        <span>{t("vat")} (15%)</span>
                        <span className="font-semibold text-gray-900">
                          ${invoice.taxAmount.toFixed(2)}
                        </span>
                      </div>
                    ) : null}

                    <div className="pt-4 border-t border-gray-200 border-dashed">
                      <div className="flex justify-between items-end">
                        <span className="font-bold text-gray-900 text-lg">
                          {t("total")}
                        </span>
                        <span className="text-3xl font-black text-slate-800 tracking-tight">
                          ${invoice.totalAmount?.toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer text */}
              <div className="flex flex-col items-center justify-center pt-8 border-t border-gray-100 space-y-2">
                <p className="text-gray-500 italic font-serif text-lg">
                  "{t("thank_you")}"
                </p>
                <p className="text-xs text-gray-400 tracking-wider uppercase">
                  {t("generated_by_pos")}
                </p>
              </div>
            </div>
          </Card>
        </div>

        {/* Sidebar Info */}
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
      </div>

      {invoice && (
        <ReturnInvoiceModal
          isOpen={isReturnModalOpen}
          onClose={() => setIsReturnModalOpen(false)}
          invoice={invoice}
          onSuccess={fetchInvoice}
        />
      )}
    </div>
  );
}
