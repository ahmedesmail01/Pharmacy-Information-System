import { useState, useEffect, useCallback } from "react";
import { Edit2, Trash2, MapPin, Search as SearchIcon } from "lucide-react";
import toast from "react-hot-toast";
import PageHeader from "@/components/shared/PageHeader";
import SearchBar from "@/components/shared/SearchBar";
import Table from "@/components/ui/Table";
import Pagination from "@/components/ui/Pagination";
import Badge from "@/components/ui/Badge";
import Modal from "@/components/ui/Modal";
import Button from "@/components/ui/Button";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import BranchForm from "./BranchForm";
import { branchService } from "@/api/branchService";
import { useQueryTable } from "@/hooks/useQuery";
import { handleApiError } from "@/utils/handleApiError";
import { BranchDto, FilterOperation } from "@/types";

export default function BranchesPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedBranch, setSelectedBranch] = useState<BranchDto | null>(null);
  const [isActionLoading, setIsActionLoading] = useState(false);

  const { data, isLoading, pageNumber, setPageNumber, totalPages, fetch } =
    useQueryTable<BranchDto>({
      service: branchService.query,
      pageSize: 10,
    });

  const loadData = useCallback(() => {
    // Specifically targeting branchName for search as per SOP
    const filters = searchTerm
      ? [
          {
            propertyName: "branchName",
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

  const handleCreateOrUpdate = async (formData: any) => {
    setIsActionLoading(true);
    try {
      if (selectedBranch) {
        await branchService.update(selectedBranch.oid, formData);
        toast.success("Branch updated successfully");
      } else {
        await branchService.create(formData);
        toast.success("Branch created successfully");
      }
      setIsFormOpen(false);
      loadData();
    } catch (err) {
      handleApiError(err);
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedBranch) return;
    setIsActionLoading(true);
    try {
      await branchService.delete(selectedBranch.oid);
      toast.success("Branch deleted successfully");
      setIsDeleteOpen(false);
      loadData();
    } catch (err) {
      handleApiError(err);
    } finally {
      setIsActionLoading(false);
    }
  };

  const columns = [
    {
      header: "Branch Code",
      accessorKey: "branchCode",
      cell: (info: any) =>
        info.getValue() || (
          <span className="text-gray-400 italic">No code</span>
        ),
    },
    {
      header: "Branch Name",
      accessorKey: "branchName",
      cell: (info: any) => (
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-blue-50 text-blue-600 rounded-md">
            <MapPin className="h-4 w-4" />
          </div>
          <span className="font-semibold text-gray-900">{info.getValue()}</span>
        </div>
      ),
    },
    {
      header: "Location",
      accessorFn: (row: BranchDto) =>
        `${row.city || ""}${row.city && row.district ? ", " : ""}${row.district || ""}`,
      cell: (info: any) =>
        info.getValue() || <span className="text-gray-400">---</span>,
    },
    {
      header: "Users",
      accessorKey: "userCount",
      cell: (info: any) => (
        <Badge
          variant="default"
          className="bg-purple-50 text-purple-700 border border-purple-100"
        >
          {info.getValue()} Users
        </Badge>
      ),
    },
    {
      header: "Stock",
      accessorKey: "stockCount",
      cell: (info: any) => (
        <Badge
          variant="default"
          className="bg-green-50 text-green-700 border border-green-100"
        >
          {info.getValue()} Items
        </Badge>
      ),
    },
    {
      header: "Status",
      accessorKey: "status",
      cell: (info: any) => (
        <Badge variant={info.getValue() === 1 ? "success" : "danger"}>
          {info.getValue() === 1 ? "Active" : "Inactive"}
        </Badge>
      ),
    },
    {
      header: "Actions",
      id: "actions",
      cell: (info: any) => (
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setSelectedBranch(info.row.original);
              setIsFormOpen(true);
            }}
            className="text-blue-600 hover:bg-blue-50"
          >
            <Edit2 className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setSelectedBranch(info.row.original);
              setIsDeleteOpen(true);
            }}
            className="text-red-600 hover:bg-red-50"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Branches"
        onAddClick={() => {
          setSelectedBranch(null);
          setIsFormOpen(true);
        }}
        addLabel="Add Branch"
      />

      <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4">
        <SearchBar
          onSearch={setSearchTerm}
          placeholder="Filter by branch name..."
        />
        <div className="text-sm text-gray-500">
          Showing <span className="font-bold text-gray-900">{data.length}</span>{" "}
          branches
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
        title={selectedBranch ? "Edit Branch" : "Add New Branch"}
        size="lg"
      >
        <BranchForm
          initialData={selectedBranch}
          onSubmit={handleCreateOrUpdate}
          isLoading={isActionLoading}
        />
      </Modal>

      <ConfirmDialog
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={handleDelete}
        title="Delete Branch"
        message={`Are you sure you want to delete "${selectedBranch?.branchName}"? This action cannot be undone.`}
        isLoading={isActionLoading}
      />
    </div>
  );
}
