import { useState, useEffect, useCallback } from "react";
import {
  UserCircle,
  Edit2,
  Trash2,
  Mail,
  Phone,
  Briefcase,
} from "lucide-react";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";
import PageHeader from "@/components/shared/PageHeader";
import SearchBar from "@/components/shared/SearchBar";
import Table from "@/components/ui/Table";
import Pagination from "@/components/ui/Pagination";
import Badge from "@/components/ui/Badge";
import Modal from "@/components/ui/Modal";
import Button from "@/components/ui/Button";
import Select from "@/components/ui/Select";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import StakeholderForm from "./StakeholderForm";
import { stakeholderService } from "@/api/stakeholderService";
import { lookupService } from "@/api/lookupService";
import { useQueryTable } from "@/hooks/useQuery";
import { handleApiError } from "@/utils/handleApiError";
import { StakeholderDto, AppLookupDetailDto, FilterOperation } from "@/types";
import { useLookup } from "@/context/LookupContext";

export default function StakeholdersPage() {
  const { t, i18n } = useTranslation("stakeholders");
  const { getLookupDetails } = useLookup();
  const isAr = i18n.language === "ar";
  const stakeholderTypes = getLookupDetails("STAKEHOLDER_TYPE");
  const tc = useTranslation("common").t;
  const [searchTerm, setSearchTerm] = useState("");
  const [stakeholderTypeCode, setStakeholderTypeCode] = useState("");
  const [types, setTypes] = useState<AppLookupDetailDto[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedStakeholder, setSelectedStakeholder] =
    useState<StakeholderDto | null>(null);
  const [isActionLoading, setIsActionLoading] = useState(false);
  const [isDetailLoading, setIsDetailLoading] = useState(false);

  console.log(getLookupDetails("STAKEHOLDER_TYPE"));

  const {
    data,
    isLoading,
    pageNumber,
    setPageNumber,
    totalPages,
    totalRecords,
    fetch,
  } = useQueryTable<StakeholderDto>({
    service: stakeholderService.query,
    pageSize: 10,
  });

  useEffect(() => {
    const fetchTypes = async () => {
      try {
        const res = await lookupService.getByCode("STAKEHOLDER_TYPE");
        setTypes(res.data.data?.lookupDetails || []);
      } catch (err) {
        console.error("Failed to fetch types", err);
      }
    };
    fetchTypes();
  }, []);

  const loadData = useCallback(() => {
    const filters = [];
    if (searchTerm) {
      filters.push({
        propertyName: "name",
        value: searchTerm,
        operation: FilterOperation.Contains,
      });
    }
    if (stakeholderTypeCode) {
      filters.push({
        propertyName: "stakeholderTypeId",
        value: stakeholderTypeCode,
        operation: FilterOperation.Equals,
      });
    }
    fetch("", filters);
  }, [fetch, searchTerm, stakeholderTypeCode]);

  useEffect(() => {
    loadData();
  }, [loadData, pageNumber]);

  const handleCreateOrUpdate = async (formData: any) => {
    setIsActionLoading(true);
    try {
      if (selectedStakeholder) {
        await stakeholderService.update(selectedStakeholder.oid, {
          ...formData,
          oid: selectedStakeholder.oid,
        });
        toast.success(t("stakeholderUpdated"));
      } else {
        await stakeholderService.create(formData);
        toast.success(t("stakeholderAdded"));
      }
      setIsFormOpen(false);
      loadData();
    } catch (err) {
      handleApiError(err);
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleEdit = async (id: string) => {
    setIsDetailLoading(true);
    try {
      const res = await stakeholderService.getById(id);
      setSelectedStakeholder(res.data.data);
      setIsFormOpen(true);
    } catch (err) {
      handleApiError(err);
    } finally {
      setIsDetailLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedStakeholder) return;
    setIsActionLoading(true);
    try {
      await stakeholderService.delete(selectedStakeholder.oid);
      toast.success(t("stakeholderDeleted"));
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
      header: t("name"),
      accessorKey: "name",
      cell: (info: any) => (
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 border border-blue-100 uppercase font-black">
            {info.getValue()?.charAt(0)}
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-gray-900">{info.getValue()}</span>
            <span className="text-[10px] text-gray-400 font-bold uppercase tracking-tight">
              #{info.row.original.oid.slice(0, 8)}
            </span>
          </div>
        </div>
      ),
    },

    {
      header: t("stakeholderTypeId"),
      accessorKey: "stakeholderTypeId",
      cell: (info: any) => (
        <div className="flex items-center gap-3">
          {isAr
            ? stakeholderTypes.find((x) => x.oid === info.getValue())
                ?.valueNameAr
            : stakeholderTypes.find((x) => x.oid === info.getValue())
                ?.valueNameEn || "-"}
        </div>
      ),
    },

    {
      header: t("address"),
      accessorKey: "address",
      cell: (info: any) => (
        <div className="flex items-center gap-3">{info.getValue() || "-"}</div>
      ),
    },

    {
      header: t("city"),
      accessorKey: "city",
      cell: (info: any) => (
        <div className="flex items-center gap-3">{info.getValue() || "-"}</div>
      ),
    },
    {
      header: t("district"),
      accessorKey: "district",
      cell: (info: any) => (
        <div className="flex items-center gap-3">{info.getValue() || "-"}</div>
      ),
    },

    {
      header: tc("status"),
      accessorKey: "status",
      cell: (info: any) => (
        <Badge variant={info.getValue() === 1 ? "success" : "danger"}>
          {info.getValue() === 1 ? tc("active") : tc("inactive")}
        </Badge>
      ),
    },
    {
      header: tc("actions"),
      id: "actions",
      cell: (info: any) => (
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleEdit(info.row.original.oid)}
            className="text-blue-600 p-0 hover:bg-blue-50"
            isLoading={
              isDetailLoading &&
              selectedStakeholder?.oid === info.row.original.oid
            }
          >
            <Edit2 className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setSelectedStakeholder(info.row.original);
              setIsDeleteOpen(true);
            }}
            className="text-red-600  p-0 hover:bg-red-50"
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
          setSelectedStakeholder(null);
          setIsFormOpen(true);
        }}
        addLabel={t("addStakeholder")}
      />

      <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex flex-col md:flex-row gap-6 items-end">
        <div className="flex-1 space-y-2">
          <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">
            {tc("search")}
          </label>
          <SearchBar
            onSearch={setSearchTerm}
            placeholder={t("searchPlaceholder")}
          />
        </div>
        <div className="w-full md:w-64 space-y-2">
          <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">
            {t("type")}
          </label>
          <Select
            value={stakeholderTypeCode}
            onChange={(e) => setStakeholderTypeCode(e.target.value)}
            options={types.map((t) => ({
              value: t.oid || "",
              label: t.valueNameEn || "",
            }))}
            className="h-[42px]"
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

      <Modal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        title={selectedStakeholder ? t("editStakeholder") : t("addStakeholder")}
        size="lg"
      >
        <StakeholderForm
          initialData={selectedStakeholder}
          onSubmit={handleCreateOrUpdate}
          isLoading={isActionLoading}
        />
      </Modal>

      <ConfirmDialog
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={handleDelete}
        title={t("deleteStakeholder")}
        message={tc("deleteConfirm")}
        isLoading={isActionLoading}
      />
    </div>
  );
}
