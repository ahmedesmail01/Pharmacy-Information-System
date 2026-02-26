import { useState, useEffect, useCallback } from "react";
import { Settings, Eye, Database } from "lucide-react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import PageHeader from "@/components/shared/PageHeader";
import SearchBar from "@/components/shared/SearchBar";
import Table from "@/components/ui/Table";
import Pagination from "@/components/ui/Pagination";
import Badge from "@/components/ui/Badge";
import Modal from "@/components/ui/Modal";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { lookupService } from "@/api/lookupService";
import { useQueryTable } from "@/hooks/useQuery";
import { handleApiError } from "@/utils/handleApiError";
import { AppLookupMasterDto, FilterOperation } from "@/types";

export default function LookupsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isActionLoading, setIsActionLoading] = useState(false);

  const {
    data,
    isLoading,
    pageNumber,
    setPageNumber,
    totalPages,
    totalRecords,
    fetch,
  } = useQueryTable<AppLookupMasterDto>({
    service: lookupService.query,
    pageSize: 10,
  });

  const loadData = useCallback(() => {
    const filters = searchTerm
      ? [
          {
            propertyName: "lookupName",
            value: searchTerm,
            operation: FilterOperation.Contains,
          },
        ]
      : [];
    fetch("", filters);
  }, [fetch, searchTerm]);

  useEffect(() => {
    loadData();
  }, [loadData, pageNumber]);

  const handleCreateMaster = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = {
      lookupCode: formData.get("lookupCode") as string,
      lookupNameAr: formData.get("lookupNameAr") as string,
      lookupNameEn: formData.get("lookupNameEn") as string,
      status: 1,
    };

    setIsActionLoading(true);
    try {
      await lookupService.createMaster(data);
      toast.success("Lookup category created");
      setIsFormOpen(false);
      loadData();
    } catch (err) {
      handleApiError(err);
    } finally {
      setIsActionLoading(false);
    }
  };

  const columns = [
    {
      header: "Category Code",
      accessorKey: "lookupCode",
      cell: (info: any) => (
        <span className="font-mono font-bold text-gray-400 bg-gray-50 px-2 py-1 rounded border border-gray-100 uppercase tracking-tighter">
          {info.getValue()}
        </span>
      ),
    },
    {
      header: "Lookup Name",
      accessorKey: "lookupNameEn",
      cell: (info: any) => (
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
            <Settings className="h-4 w-4" />
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-gray-900">{info.getValue()}</span>
            <span className="text-xs text-gray-400 font-medium">
              {info.row.original.lookupNameAr || "---"}
            </span>
          </div>
        </div>
      ),
    },
    {
      header: "Variants",
      accessorKey: "detailCount",
      cell: (info: any) => (
        <Badge className="bg-gray-50 text-gray-500 border border-gray-100">
          {info.getValue() || 0} Options
        </Badge>
      ),
    },
    {
      header: "Status",
      accessorKey: "status",
      cell: (info: any) => (
        <Badge variant={info.getValue() === 1 ? "success" : "danger"}>
          {info.getValue() === 1 ? "Active" : "Locked"}
        </Badge>
      ),
    },
    {
      header: "Actions",
      id: "actions",
      cell: (info: any) => (
        <Link to={`/lookups/${info.row.original.lookupCode}`}>
          <Button
            variant="ghost"
            size="sm"
            className="text-blue-600 gap-2 hover:bg-blue-50"
          >
            <Eye className="h-4 w-4" />
            Manage Details
          </Button>
        </Link>
      ),
    },
  ];

  return (
    <div className="max-w-full mx-auto space-y-6">
      <PageHeader
        title="System Lookups & Enums"
        onAddClick={() => setIsFormOpen(true)}
        addLabel="Create Category"
      />

      <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4">
        <SearchBar
          onSearch={setSearchTerm}
          placeholder="Filter lookup categories..."
        />
        <div className="flex items-center gap-2 text-xs font-black text-gray-400 uppercase tracking-widest px-4">
          <Database className="h-3 w-3" />
          Catalog Entries: <span className="text-gray-900">{totalRecords}</span>
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

      <Modal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        title="Create New Lookup Category"
      >
        <form onSubmit={handleCreateMaster} className="space-y-6">
          <div className="space-y-4">
            <Input
              name="lookupCode"
              label="Category Code (Uppercase)*"
              placeholder="e.g. PRODUCT_CATEGORY"
              required
            />
            <Input
              name="lookupNameEn"
              label="Name (English)*"
              placeholder="e.g. Product Category"
              required
            />
            <Input
              name="lookupNameAr"
              label="Name (Arabic)"
              placeholder="e.g. فئة المنتج"
              required
            />
          </div>
          <div className="flex justify-end pt-4">
            <Button
              type="submit"
              isLoading={isActionLoading}
              className="w-full shadow-lg shadow-blue-100"
            >
              Register Category
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
