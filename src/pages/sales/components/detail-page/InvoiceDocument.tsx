import { forwardRef } from "react";
import Card from "@/components/ui/Card";
import { SalesInvoiceDto } from "@/types";
import InvoiceDocumentHeader from "./InvoiceDocumentHeader";
import InvoiceInfoGrid from "./InvoiceInfoGrid";
import InvoiceItemsTable from "./InvoiceItemsTable";
import InvoiceFooter from "./InvoiceFooter";

interface InvoiceDocumentProps {
  invoice: SalesInvoiceDto;
}

const InvoiceDocument = forwardRef<HTMLDivElement, InvoiceDocumentProps>(
  ({ invoice }, ref) => {
    return (
      <Card
        ref={ref}
        className="overflow-hidden border-none shadow-2xl shadow-gray-200/50 bg-white print:shadow-none print:w-full"
      >
        <InvoiceDocumentHeader invoice={invoice} />

        <div className="p-8 sm:p-10 space-y-10">
          <InvoiceInfoGrid invoice={invoice} />
          <InvoiceItemsTable invoice={invoice} />
          <InvoiceFooter />
        </div>
      </Card>
    );
  },
);

InvoiceDocument.displayName = "InvoiceDocument";

export default InvoiceDocument;
