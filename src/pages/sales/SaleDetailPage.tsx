import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import {
  ArrowLeft,
  Printer,
  Download,
  User,
  CreditCard,
  CheckCircle,
  FileText,
  MapPin,
} from "lucide-react";
import { format } from "date-fns";
import { useTranslation } from "react-i18next";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import Spinner from "@/components/ui/Spinner";
import { salesService } from "@/api/salesService";
import { SalesInvoiceDto } from "@/types";
import { handleApiError } from "@/utils/handleApiError";

export default function SaleDetailPage() {
  const { t } = useTranslation("sales");
  const tc = useTranslation("common").t;
  const { id } = useParams();
  const [invoice, setInvoice] = useState<SalesInvoiceDto | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchInvoice = async () => {
      if (!id) return;
      try {
        const res = await salesService.getById(id);
        setInvoice(res.data.data);
      } catch (err) {
        handleApiError(err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchInvoice();
  }, [id]);

  if (isLoading) {
    return (
      <div className="h-[60vh] flex flex-col items-center justify-center gap-4">
        <Spinner size="lg" />
        <p className="text-gray-500 font-medium">{t("fetching_invoice")}</p>
      </div>
    );
  }

  if (!invoice) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">{t("invoice_not_found")}</p>
        <Link to="/sales">
          <Button variant="ghost" className="mt-4">
            {t("back_to_sales")}
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <Link to="/sales">
          <Button
            variant="ghost"
            className="gap-2 text-gray-500 hover:text-gray-900"
          >
            <ArrowLeft className="h-4 w-4 rtl:rotate-180" />
            {t("back_to_sales")}
          </Button>
        </Link>
        <div className="flex items-center gap-3">
          <Button variant="secondary" size="sm" className="gap-2">
            <Download className="h-4 w-4" />
            {t("export_pdf")}
          </Button>
          <Button
            onClick={() => window.print()}
            className="gap-2 shadow-lg shadow-blue-100"
          >
            <Printer className="h-4 w-4" />
            {t("print_invoice")}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2 space-y-8">
          <Card className="overflow-hidden border-none shadow-xl shadow-gray-200/50">
            <div className="bg-blue-600 p-8 text-white relative">
              <div className="absolute top-0 right-0 p-8 opacity-10">
                <FileText className="h-32 w-32" />
              </div>
              <div className="flex justify-between items-start relative z-10">
                <div>
                  <h1 className="text-3xl font-black tracking-tight">
                    {t("invoice").toUpperCase()}
                  </h1>
                  <p className="text-blue-100 font-mono mt-1">
                    #{invoice.invoiceNumber}
                  </p>
                </div>
                <Badge className="bg-white/20 text-white border-none py-1.5 px-4 backdrop-blur-md">
                  {invoice.invoiceStatusName}
                </Badge>
              </div>
            </div>

            <div className="p-8 space-y-10">
              <div className="grid grid-cols-2 gap-8">
                <div className="space-y-4">
                  <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                    {t("customer")}
                  </h3>
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-gray-50 rounded-lg">
                      <User className="h-4 w-4 text-gray-400" />
                    </div>
                    <div>
                      <p className="font-bold text-gray-900">
                        {invoice.customerName || t("walk_in_customer")}
                      </p>
                      <p className="text-sm text-gray-500">
                        {invoice.customerPhone || "---"}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="space-y-4 text-right">
                  <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                    {t("store")}
                  </h3>
                  <div className="flex items-start gap-3 justify-end">
                    <div className="text-right">
                      <p className="font-bold text-gray-900">
                        {invoice.branchName}
                      </p>
                      <p className="text-sm text-gray-500">
                        {invoice.invoiceDate
                          ? format(
                              new Date(invoice.invoiceDate),
                              "MMMM dd, yyyy HH:mm",
                            )
                          : "---"}
                      </p>
                    </div>
                    <div className="p-2 bg-blue-50 rounded-lg">
                      <MapPin className="h-4 w-4 text-blue-600" />
                    </div>
                  </div>
                </div>
              </div>

              <div className="h-px bg-gray-100"></div>

              <div>
                <table className="w-full">
                  <thead>
                    <tr className="text-left text-[10px] text-gray-400 uppercase tracking-widest border-b border-gray-100">
                      <th className="pb-4 font-bold">{t("product")}</th>
                      <th className="pb-4 font-bold text-center">{t("qty")}</th>
                      <th className="pb-4 font-bold text-right">
                        {t("unit_price")}
                      </th>
                      <th className="pb-4 font-bold text-right">
                        {t("total")}
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {invoice.items?.map((item, idx) => (
                      <tr key={idx}>
                        <td className="py-6">
                          <p className="font-bold text-gray-900">
                            {item.productName}
                          </p>
                          <p className="text-xs text-gray-400">
                            {t("batch")}: {item.batchNumber || "---"}
                          </p>
                        </td>
                        <td className="py-6 text-center font-medium text-gray-600">
                          {item.quantity}
                        </td>
                        <td className="py-6 text-right font-medium text-gray-600">
                          ${item.unitPrice?.toFixed(2)}
                        </td>
                        <td className="py-6 text-right font-bold text-gray-900">
                          ${(item.quantity * (item.unitPrice || 0)).toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="flex flex-col items-end space-y-3 pt-6 border-t border-gray-100">
                <div className="flex justify-between w-full max-w-[240px] text-sm text-gray-500">
                  <span>{t("subtotal")}</span>
                  <span className="font-semibold text-gray-900">
                    $
                    {(
                      (invoice.totalAmount || 0) - (invoice.taxAmount || 0)
                    ).toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between w-full max-w-[240px] text-sm text-gray-500">
                  <span>{t("vat")} (15%)</span>
                  <span className="font-semibold text-gray-900">
                    ${invoice.taxAmount?.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between w-full max-w-[240px] pt-3 border-t border-gray-100">
                  <span className="font-black text-gray-900">
                    {t("total_payable")}
                  </span>
                  <span className="text-2xl font-black text-blue-600 tracking-tighter">
                    ${invoice.totalAmount?.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 px-8 py-6 border-t border-gray-100 flex justify-between items-center italic text-sm text-gray-400">
              <p>{t("thank_you")}</p>
              <p>{t("generated_by_pos")}</p>
            </div>
          </Card>
        </div>

        <div className="space-y-6">
          <Card
            title={tc("status")}
            className="bg-gradient-to-br from-blue-600 to-blue-700 text-white border-none shadow-lg"
          >
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-white/20 rounded-xl">
                  <CreditCard className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-xs text-blue-100 uppercase font-bold tracking-widest">
                    Method
                  </p>
                  <p className="font-bold text-lg">
                    {invoice.paymentMethodName || t("cash")}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="p-3 bg-white/20 rounded-xl">
                  <CheckCircle className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-xs text-blue-100 uppercase font-bold tracking-widest">
                    Status
                  </p>
                  <p className="font-bold text-lg">{t("settled")}</p>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
