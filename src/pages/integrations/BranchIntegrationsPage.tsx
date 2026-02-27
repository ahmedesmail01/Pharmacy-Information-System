import { useState, useEffect } from "react";
import { Edit2, Trash2, Eye, EyeOff, SlidersHorizontal } from "lucide-react";
import toast from "react-hot-toast";
import PageHeader from "@/components/shared/PageHeader";
import Table from "@/components/ui/Table";
import Badge from "@/components/ui/Badge";
import Modal from "@/components/ui/Modal";
import Button from "@/components/ui/Button";
import Select from "@/components/ui/Select";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import Spinner from "@/components/ui/Spinner";
import BranchIntegrationForm from "./BranchIntegrationForm";
import { branchIntegrationSettingService } from "@/api/branchIntegrationSettingService";
import { integrationProviderService } from "@/api/integrationProviderService";
import { branchService } from "@/api/branchService";
import { handleApiError } from "@/utils/handleApiError";
import {
  BranchDto,
  IntegrationProviderDto,
  BranchIntegrationSettingDto,
} from "@/types";

export default function BranchIntegrationsPage() {
  const [branches, setBranches] = useState<BranchDto[]>([]);
  const [providers, setProviders] = useState<IntegrationProviderDto[]>([]);
  const [selectedBranchId, setSelectedBranchId] = useState<string>("");
  const [settings, setSettings] = useState<BranchIntegrationSettingDto[]>([]);
  const [isLoadingSettings, setIsLoadingSettings] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editItem, setEditItem] = useState<BranchIntegrationSettingDto | null>(
    null,
  );
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [isActionLoading, setIsActionLoading] = useState(false);
  const [visibleValues, setVisibleValues] = useState<Set<string>>(new Set());
  const [isInitLoading, setIsInitLoading] = useState(true);

  // Load branches and providers on mount (parallel)
  useEffect(() => {
    const init = async () => {
      try {
        const [branchRes, providerRes] = await Promise.all([
          branchService.getAll(),
          integrationProviderService.getAll(),
        ]);
        if (branchRes.data.success) setBranches(branchRes.data.data ?? []);
        if (providerRes.data.success) setProviders(providerRes.data.data ?? []);
      } catch (e) {
        handleApiError(e);
      } finally {
        setIsInitLoading(false);
      }
    };
    init();
  }, []);

  // Load settings when branch changes
  useEffect(() => {
    if (!selectedBranchId) {
      setSettings([]);
      return;
    }
    const load = async () => {
      setIsLoadingSettings(true);
      try {
        const res =
          await branchIntegrationSettingService.getByBranch(selectedBranchId);
        if (res.data.success) setSettings(res.data.data ?? []);
      } catch (e) {
        handleApiError(e);
      } finally {
        setIsLoadingSettings(false);
      }
    };
    load();
  }, [selectedBranchId]);

  const refreshSettings = async () => {
    if (!selectedBranchId) return;
    try {
      const res =
        await branchIntegrationSettingService.getByBranch(selectedBranchId);
      if (res.data.success) setSettings(res.data.data ?? []);
    } catch (e) {
      handleApiError(e);
    }
  };

  const handleCreateOrUpdate = async (formData: any) => {
    setIsActionLoading(true);
    try {
      if (editItem) {
        await branchIntegrationSettingService.update(editItem.oid, {
          ...formData,
          oid: editItem.oid,
        });
        toast.success("Setting updated successfully");
      } else {
        await branchIntegrationSettingService.create(formData);
        toast.success("Setting created successfully");
      }
      setIsModalOpen(false);
      setEditItem(null);
      refreshSettings();
    } catch (err) {
      handleApiError(err);
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setIsActionLoading(true);
    try {
      const res = await branchIntegrationSettingService.delete(deleteTarget);
      if (res.data.data === true) {
        toast.success("Setting deleted");
        refreshSettings();
      } else {
        toast.error(res.data.message || "Delete failed");
      }
    } catch (err) {
      handleApiError(err);
    } finally {
      setDeleteTarget(null);
      setIsActionLoading(false);
    }
  };

  const toggleValueVisibility = (oid: string) => {
    setVisibleValues((prev) => {
      const next = new Set(prev);
      if (next.has(oid)) next.delete(oid);
      else next.add(oid);
      return next;
    });
  };

  const formatDate = (dateStr: string | null | undefined) => {
    if (!dateStr) return "—";
    return new Date(dateStr).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const columns = [
    {
      header: "Provider",
      accessorKey: "integrationProviderName",
      cell: (info: any) => (
        <span className="font-semibold text-gray-900">
          {info.getValue() || "—"}
        </span>
      ),
    },
    {
      header: "Integration Key",
      accessorKey: "integrationKey",
      cell: (info: any) => (
        <span className="font-mono text-sm text-gray-600">
          {info.getValue() || "—"}
        </span>
      ),
    },
    {
      header: "Integration Value",
      accessorKey: "integrationValue",
      cell: (info: any) => {
        const oid = info.row.original.oid;
        const isVisible = visibleValues.has(oid);
        const val = info.getValue();
        return (
          <div className="flex items-center gap-2">
            <span className="font-mono text-sm text-gray-600">
              {!val ? "—" : isVisible ? val : "●●●●●●●●"}
            </span>
            {val && (
              <button
                onClick={() => toggleValueVisibility(oid)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                {isVisible ? (
                  <EyeOff className="h-3.5 w-3.5" />
                ) : (
                  <Eye className="h-3.5 w-3.5" />
                )}
              </button>
            )}
          </div>
        );
      },
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
      header: "Created",
      accessorKey: "createdAt",
      cell: (info: any) => (
        <span className="text-sm text-gray-500">
          {formatDate(info.getValue())}
        </span>
      ),
    },
    {
      header: "Updated",
      accessorKey: "updatedAt",
      cell: (info: any) => (
        <span className="text-sm text-gray-500">
          {formatDate(info.getValue())}
        </span>
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
              setEditItem(info.row.original);
              setIsModalOpen(true);
            }}
            className="text-blue-600 h-8 w-8 p-0 hover:bg-blue-50"
          >
            <Edit2 className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setDeleteTarget(info.row.original.oid)}
            className="text-red-600 h-8 w-8 p-0 hover:bg-red-50"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ];

  if (isInitLoading) {
    return (
      <div className="h-[60vh] flex flex-col items-center justify-center gap-4">
        <Spinner size="lg" />
        <p className="text-gray-500 font-medium">Loading...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
      <PageHeader
        title="Branch Integration Settings"
        onAddClick={() => {
          if (!selectedBranchId) {
            toast.error("Please select a branch first");
            return;
          }
          setEditItem(null);
          setIsModalOpen(true);
        }}
        addLabel="Add Setting"
      />

      <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
        <div className="flex items-center gap-3">
          <SlidersHorizontal className="h-5 w-5 text-gray-400" />
          <div className="flex-1 max-w-sm">
            <select
              value={selectedBranchId}
              onChange={(e) => setSelectedBranchId(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
            >
              <option value="">Select a branch...</option>
              {branches.map((b) => (
                <option key={b.oid} value={b.oid}>
                  {b.branchName}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {!selectedBranchId ? (
        <div className="flex flex-col items-center justify-center py-20 text-gray-400">
          <SlidersHorizontal className="h-12 w-12 mb-4 opacity-30" />
          <p className="font-medium text-lg">Select a branch</p>
          <p className="text-sm">
            Choose a branch above to view or manage its integration settings.
          </p>
        </div>
      ) : (
        <Table
          columns={columns}
          data={settings}
          isLoading={isLoadingSettings}
        />
      )}

      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditItem(null);
        }}
        title={editItem ? "Edit Setting" : "Add Integration Setting"}
      >
        <BranchIntegrationForm
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setEditItem(null);
          }}
          onSuccess={refreshSettings}
          selectedBranchId={selectedBranchId}
          editItem={editItem}
          providers={providers}
          onSubmit={handleCreateOrUpdate}
          isLoading={isActionLoading}
        />
      </Modal>

      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Delete Setting"
        message="Are you sure you want to delete this integration setting? This action cannot be undone."
        isLoading={isActionLoading}
      />
    </div>
  );
}
