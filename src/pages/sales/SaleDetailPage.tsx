import { useEffect, useState, useRef, useCallback } from "react";
import { useParams } from "react-router-dom";
import { useReactToPrint } from "react-to-print";
import { salesService } from "@/api/salesService";
import { SalesInvoiceDto } from "@/types";
import { handleApiError } from "@/utils/handleApiError";

import ReturnInvoiceModal from "./components/ReturnInvoiceModal";
import SaleDetailLoading from "./components/detail-page/SaleDetailLoading";
import SaleDetailNotFound from "./components/detail-page/SaleDetailNotFound";
import SaleDetailHeader from "./components/detail-page/SaleDetailHeader";
import InvoiceDocument from "./components/detail-page/InvoiceDocument";
import InvoiceSidebar from "./components/detail-page/InvoiceSidebar";

export default function SaleDetailPage() {
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
    return <SaleDetailLoading />;
  }

  if (!invoice) {
    return <SaleDetailNotFound />;
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <SaleDetailHeader
        onPrint={() => handlePrint()}
        onReturn={() => setIsReturnModalOpen(true)}
      />

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        <div className="xl:col-span-2">
          <InvoiceDocument ref={componentRef} invoice={invoice} />
        </div>

        <InvoiceSidebar invoice={invoice} />
      </div>

      <ReturnInvoiceModal
        isOpen={isReturnModalOpen}
        onClose={() => setIsReturnModalOpen(false)}
        invoice={invoice}
        onSuccess={fetchInvoice}
      />
    </div>
  );
}
