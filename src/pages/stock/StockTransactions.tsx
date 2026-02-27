import { useState, useEffect, useCallback } from "react";
import { ArrowUpRight, ArrowDownLeft, Shuffle } from "lucide-react";
import { format } from "date-fns";
import Table from "@/components/ui/Table";
import Pagination from "@/components/ui/Pagination";
import SearchBar from "@/components/shared/SearchBar";
import Badge from "@/components/ui/Badge";
import { useTranslation } from "react-i18next";
import { stockService } from "@/api/stockService";
import { useQueryTable } from "@/hooks/useQuery";
import { StockTransactionDto, FilterOperation } from "@/types";

export default function StockTransactions() {
  const { t } = useTranslation("stock");
  const tc = useTranslation("common").t;
  const [searchTerm, setSearchTerm] = useState("");

  const {
    data,
    isLoading,
    pageNumber,
    setPageNumber,
    totalPages,
    totalRecords,
    fetch,
  } = useQueryTable<StockTransactionDto>({
    service: stockService.queryTransactions,
    pageSize: 10,
  });

  const loadData = useCallback(() => {
    const filters = [];
    if (searchTerm) {
      filters.push({
        propertyName: "productName",
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
      header: tc("date"),
      accessorKey: "transactionDate",
      cell: (info: any) => (
        <span className="text-xs font-bold text-gray-500 font-mono">
          {info.getValue()
            ? format(new Date(info.getValue()), "MM-dd HH:mm")
            : "---"}
        </span>
      ),
    },
    {
      header: tc("type"),
      accessorKey: "transactionTypeName",
      cell: (info: any) => {
        const type = info.getValue() || "";
        let icon = <Shuffle className="h-3 w-3" />;
        let colorClass = "bg-gray-100 text-gray-700";

        if (type.includes("In") || type.includes("Receive")) {
          icon = <ArrowDownLeft className="h-3 w-3" />;
          colorClass = "bg-green-100 text-green-700";
        } else if (type.includes("Sale") || type.includes("Out")) {
          icon = <ArrowUpRight className="h-3 w-3" />;
          colorClass = "bg-blue-100 text-blue-700";
        } else if (type.includes("Transfer")) {
          icon = <Shuffle className="h-3 w-3" />;
          colorClass = "bg-purple-100 text-purple-700";
        }

        return (
          <Badge className={`${colorClass} gap-1 px-1.5`}>
            {icon}
            {type}
          </Badge>
        );
      },
    },
    {
      header: t("product"),
      accessorKey: "productName",
      cell: (info: any) => (
        <p className="font-bold text-gray-900 text-sm">{info.getValue()}</p>
      ),
    },
    {
      header: t("qty"),
      accessorKey: "quantity",
      cell: (info: any) => (
        <span className="font-black text-gray-900">{info.getValue()}</span>
      ),
    },
    {
      header: t("batch_number"),
      accessorKey: "batchNumber",
      cell: (info: any) => (
        <span className="font-mono text-[10px] font-bold text-gray-400">
          {info.getValue() || "---"}
        </span>
      ),
    },
    {
      header: t("from_to"),
      id: "branches",
      cell: (info: any) => (
        <div className="flex flex-col text-[10px] font-bold uppercase tracking-tight">
          <span className="text-gray-400">
            {t("from")}: {info.row.original.fromBranchName || "---"}
          </span>
          <span className="text-blue-500">
            {t("to")}: {info.row.original.toBranchName || "---"}
          </span>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between">
        <SearchBar
          onSearch={setSearchTerm}
          placeholder={t("filter_placeholder")}
        />
        <div className="text-xs font-bold text-gray-400 uppercase tracking-widest">
          {t("found")} <span className="text-gray-900">{totalRecords}</span>{" "}
          {t("entries")}
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
  );
}
