import { useState, useEffect, useCallback } from "react";
import { Edit2, Trash2, Home, Search as SearchIcon } from "lucide-react";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";
import PageHeader from "@/components/shared/PageHeader";
import SearchBar from "@/components/shared/SearchBar";
import Table from "@/components/ui/Table";
import Pagination from "@/components/ui/Pagination";
import Badge from "@/components/ui/Badge";
import Modal from "@/components/ui/Modal";
import Button from "@/components/ui/Button";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import StoreForm from "./StoreForm";
import { storeService } from "@/api/storeService";
import { useQueryTable } from "@/hooks/useQuery";
import { handleApiError } from "@/utils/handleApiError";
import { StoreDto, FilterOperation } from "@/types";

export default function StoresPage() {
  const { t } = useTranslation("stores");
  const tc = useTranslation("common").t;
  const [searchTerm, setSearchTerm] = useState("");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedStore, setSelectedStore] = useState<StoreDto | null>(null);
  const [isActionLoading, setIsActionLoading] = useState(false);

  const { data, isLoading, pageNumber, setPageNumber, totalPages, fetch } =
    useQueryTable<StoreDto>({
      service: storeService.query,
      pageSize: 10,
    });

  const loadData = useCallback(() => {
    const filters = searchTerm
      ? [
          {
            propertyName: "storeName",
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
      if (selectedStore) {
        await storeService.update(selectedStore.oid, {
          ...formData,
          oid: selectedStore.oid,
        });
        toast.success(t("storeUpdated"));
      } else {
        await storeService.create(formData);
        toast.success(t("storeCreated"));
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
    if (!selectedStore) return;
    setIsActionLoading(true);
    try {
      await storeService.delete(selectedStore.oid);
      toast.success(t("storeDeleted"));
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
      header: t("storeCode"),
      accessorKey: "storeCode",
      cell: (info: any) =>
        info.getValue() || (
          <span className="text-gray-400 italic">No code</span>
        ),
    },
    {
      header: t("storeName"),
      accessorKey: "storeName",
      cell: (info: any) => (
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-blue-50 text-blue-600 rounded-md">
            <Home className="h-4 w-4" />
          </div>
          <span className="font-semibold text-gray-900">{info.getValue()}</span>
        </div>
      ),
    },
    {
      header: t("branch"),
      accessorKey: "branchName",
      cell: (info: any) =>
        info.getValue() || <span className="text-gray-400">---</span>,
    },
    {
      header: t("status"),
      accessorKey: "isActive",
      cell: (info: any) => (
        <Badge variant={info.getValue() ? "success" : "danger"}>
          {info.getValue() ? tc("active") : tc("inactive")}
        </Badge>
      ),
    },
    {
      header: tc("actions"),
      id: "actions",
      cell: (info: any) => (
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setSelectedStore(info.row.original);
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
              setSelectedStore(info.row.original);
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
        title={t("title")}
        onAddClick={() => {
          setSelectedStore(null);
          setIsFormOpen(true);
        }}
        addLabel={t("addStore")}
      />

      <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4">
        <SearchBar
          onSearch={setSearchTerm}
          placeholder={t("searchPlaceholder")}
        />
        <div className="text-sm text-gray-500">
          Showing <span className="font-bold text-gray-900">{data.length}</span>{" "}
          stores
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
        title={selectedStore ? t("editStore") : t("addStore")}
        size="lg"
      >
        <StoreForm
          initialData={selectedStore}
          onSubmit={handleCreateOrUpdate}
          isLoading={isActionLoading}
        />
      </Modal>

      <ConfirmDialog
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={handleDelete}
        title={t("deleteStore")}
        message={t("deleteConfirm")}
        isLoading={isActionLoading}
      />
    </div>
  );
}
