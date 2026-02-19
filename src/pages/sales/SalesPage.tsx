import { useState, useEffect, useCallback } from "react";
import {
  Plus,
  Eye,
  Printer,
  Calendar,
  User as UserIcon,
  CreditCard,
} from "lucide-react";
import { format, startOfMonth, endOfMonth } from "date-fns";
import { Link } from "react-router-dom";
import PageHeader from "@/components/shared/PageHeader";
import SearchBar from "@/components/shared/SearchBar";
import Table from "@/components/ui/Table";
import Pagination from "@/components/ui/Pagination";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import Modal from "@/components/ui/Modal";
import { salesService } from "@/api/salesService";
import { useQueryTable } from "@/hooks/useQuery";
import { SalesInvoiceDto, FilterOperation } from "@/types";
import SaleForm from "./SaleForm";

export default function SalesPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [dateRange, setDateRange] = useState({
    start: format(startOfMonth(new Date()), "yyyy-MM-dd"),
    end: format(endOfMonth(new Date()), "yyyy-MM-dd"),
  });

  const {
    data,
    isLoading,
    pageNumber,
    setPageNumber,
    totalPages,
    totalRecords,
    fetch,
  } = useQueryTable<SalesInvoiceDto>({
    service: salesService.query,
    pageSize: 10,
  });

  const loadData = useCallback(() => {
    const filters = [];
    if (searchTerm) {
      filters.push({
        propertyName: "invoiceNumber",
        value: searchTerm,
        operation: FilterOperation.Contains,
      });
    }
    fetch("", filters);
  }, [fetch, searchTerm]);

  useEffect(() => {
    loadData();
  }, [loadData, pageNumber]);

  const columns = [
    {
      header: "Invoice #",
      accessorKey: "invoiceNumber",
      cell: (info: any) => (
        <span className="font-bold text-blue-600 font-mono tracking-tight">
          {info.getValue()}
        </span>
      ),
    },
    {
      header: "Date",
      accessorKey: "invoiceDate",
      cell: (info: any) => (
        <div className="flex items-center gap-2 text-gray-500">
          <Calendar className="h-3.5 w-3.5" />
          <span className="text-xs font-medium">
            {info.getValue()
              ? format(new Date(info.getValue()), "MMM dd, yyyy HH:mm")
              : "---"}
          </span>
        </div>
      ),
    },
    {
      header: "Customer",
      accessorKey: "customerName",
      cell: (info: any) => (
        <div className="flex items-center gap-2">
          <div className="h-7 w-7 rounded-full bg-gray-100 flex items-center justify-center">
            <UserIcon className="h-3.5 w-3.5 text-gray-400" />
          </div>
          <span className="font-semibold text-gray-900">
            {info.getValue() || "Walk-in Customer"}
          </span>
        </div>
      ),
    },
    {
      header: "Amount",
      accessorKey: "totalAmount",
      cell: (info: any) => (
        <div className="flex flex-col">
          <span className="font-bold text-gray-900">
            ${info.getValue()?.toFixed(2)}
          </span>
          <span className="text-[10px] text-gray-400 font-bold uppercase">
            VAT: ${info.row.original.taxAmount?.toFixed(2)}
          </span>
        </div>
      ),
    },
    {
      header: "Payment",
      accessorKey: "paymentMethodName",
      cell: (info: any) => (
        <div className="flex items-center gap-1.5">
          <CreditCard className="h-3.5 w-3.5 text-gray-400" />
          <span className="text-xs font-medium text-gray-600">
            {info.getValue() || "Cash"}
          </span>
        </div>
      ),
    },
    {
      header: "Status",
      accessorKey: "invoiceStatusName",
      cell: (info: any) => (
        <Badge variant={info.getValue() === "Paid" ? "success" : "warning"}>
          {info.getValue() || "Pending"}
        </Badge>
      ),
    },
    {
      header: "Actions",
      id: "actions",
      cell: (info: any) => (
        <div className="flex items-center gap-1">
          <Link to={`/sales/${info.row.original.oid}`}>
            <Button
              variant="ghost"
              size="sm"
              className="text-blue-600 h-8 w-8 p-0 hover:bg-blue-50"
            >
              <Eye className="h-4 w-4" />
            </Button>
          </Link>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              /* Print Logic */
            }}
            className="text-gray-600 h-8 w-8 p-0 hover:bg-gray-100"
          >
            <Printer className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Sales Invoices"
        onAddClick={() => setIsFormOpen(true)}
        addLabel="New Sale"
      />

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <Card className="lg:col-span-1 p-5 border-blue-50">
          <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">
            Quick Stats
          </h3>
          <div className="space-y-6">
            <div>
              <p className="text-xs font-medium text-gray-500 mb-1">
                Mthly Count
              </p>
              <p className="text-xl font-bold text-gray-900 tracking-tight">
                {totalRecords}{" "}
                <span className="text-xs text-green-500 font-bold ml-1">
                  +4%
                </span>
              </p>
            </div>
            <div>
              <p className="text-xs font-medium text-gray-500 mb-1">Revenue</p>
              <p className="text-xl font-bold text-blue-600 tracking-tight">
                $42,910.85
              </p>
            </div>
          </div>
        </Card>

        <div className="lg:col-span-3 space-y-4">
          <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex flex-col md:flex-row gap-4 items-center justify-between">
            <SearchBar
              onSearch={setSearchTerm}
              placeholder="Search by invoice #..."
            />
            <div className="flex items-center gap-3">
              <input
                type="date"
                value={dateRange.start}
                onChange={(e) =>
                  setDateRange({ ...dateRange, start: e.target.value })
                }
                className="text-sm border border-gray-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
              />
              <span className="text-gray-400">to</span>
              <input
                type="date"
                value={dateRange.end}
                onChange={(e) =>
                  setDateRange({ ...dateRange, end: e.target.value })
                }
                className="text-sm border border-gray-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
          </div>

          <div className="space-y-4">
            <Table columns={columns} data={data} isLoading={isLoading} />
            <Pagination
              pageNumber={pageNumber}
              totalPages={totalPages}
              onPageChange={setPageNumber}
            />
          </div>
        </div>
      </div>

      <Modal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        title="Point of Sale (New Order)"
        size="full"
      >
        <SaleForm
          onSuccess={() => {
            setIsFormOpen(false);
            loadData();
          }}
        />
      </Modal>
    </div>
  );
}
