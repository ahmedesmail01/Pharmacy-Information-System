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

export default function StakeholdersPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [stakeholderTypeCode, setStakeholderTypeCode] = useState("");
  const [types, setTypes] = useState<AppLookupDetailDto[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedStakeholder, setSelectedStakeholder] =
    useState<StakeholderDto | null>(null);
  const [isActionLoading, setIsActionLoading] = useState(false);

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
        propertyName: "fullName",
        value: searchTerm,
        operation: FilterOperation.Contains,
      });
    }
    if (stakeholderTypeCode) {
      filters.push({
        propertyName: "stakeholderTypeCode",
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
        await stakeholderService.update(selectedStakeholder.oid, formData);
        toast.success("Stakeholder updated successfully");
      } else {
        await stakeholderService.create(formData);
        toast.success("Stakeholder added successfully");
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
    if (!selectedStakeholder) return;
    setIsActionLoading(true);
    try {
      await stakeholderService.delete(selectedStakeholder.oid);
      toast.success("Stakeholder removed successfully");
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
      header: "Name",
      accessorKey: "fullName",
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
      header: "Type",
      accessorKey: "stakeholderTypeName",
      cell: (info: any) => (
        <Badge
          className={
            info.getValue() === "Vendor"
              ? "bg-orange-50 text-orange-700"
              : "bg-blue-50 text-blue-700"
          }
        >
          <Briefcase className="h-3 w-3 mr-1" />
          {info.getValue()}
        </Badge>
      ),
    },
    {
      header: "Contact Info",
      id: "contact",
      cell: (info: any) => (
        <div className="flex flex-col gap-1">
          {info.row.original.email && (
            <div className="flex items-center gap-1.5 text-xs text-gray-500">
              <Mail className="h-3 w-3" />
              {info.row.original.email}
            </div>
          )}
          {info.row.original.phoneNumber && (
            <div className="flex items-center gap-1.5 text-xs text-gray-500 font-medium">
              <Phone className="h-3 w-3" />
              {info.row.original.phoneNumber}
            </div>
          )}
        </div>
      ),
    },
    {
      header: "Tax / CR",
      id: "taxInfo",
      cell: (info: any) => (
        <div className="flex flex-col">
          {info.row.original.taxNumber && (
            <span className="text-[10px] text-gray-400 font-bold">
              VAT: {info.row.original.taxNumber}
            </span>
          )}
          {info.row.original.crNumber && (
            <span className="text-[10px] text-gray-400 font-bold">
              CR: {info.row.original.crNumber}
            </span>
          )}
        </div>
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
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setSelectedStakeholder(info.row.original);
              setIsFormOpen(true);
            }}
            className="text-blue-600 h-8 w-8 p-0 hover:bg-blue-50"
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
            className="text-red-600 h-8 w-8 p-0 hover:bg-red-50"
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
        title="Stakeholders Registry"
        onAddClick={() => {
          setSelectedStakeholder(null);
          setIsFormOpen(true);
        }}
        addLabel="Add Stakeholder"
      />

      <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex flex-col md:flex-row gap-6 items-end">
        <div className="flex-1 space-y-2">
          <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">
            Search Database
          </label>
          <SearchBar
            onSearch={setSearchTerm}
            placeholder="Search by name, email, or tax number..."
          />
        </div>
        <div className="w-full md:w-64 space-y-2">
          <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">
            Stakeholder Type
          </label>
          <Select
            value={stakeholderTypeCode}
            onChange={(e) => setStakeholderTypeCode(e.target.value)}
            options={types.map((t) => ({
              value: t.lookupDetailCode || "",
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
        title={
          selectedStakeholder
            ? `Edit ${selectedStakeholder.fullName}`
            : "Add New Stakeholder"
        }
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
        title="Remove Stakeholder"
        message={`Are you sure you want to remove "${selectedStakeholder?.fullName}"? All associated transaction history will be preserved but the entity will be marked inactive.`}
        isLoading={isActionLoading}
      />
    </div>
  );
}
