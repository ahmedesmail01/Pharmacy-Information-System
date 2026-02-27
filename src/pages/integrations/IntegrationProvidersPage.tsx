import { useState, useEffect } from "react";
import { Edit2, Trash2, Plug } from "lucide-react";
import toast from "react-hot-toast";
import PageHeader from "@/components/shared/PageHeader";
import Table from "@/components/ui/Table";
import Badge from "@/components/ui/Badge";
import Modal from "@/components/ui/Modal";
import Button from "@/components/ui/Button";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import Spinner from "@/components/ui/Spinner";
import IntegrationProviderForm from "./IntegrationProviderForm";
import { integrationProviderService } from "@/api/integrationProviderService";
import { handleApiError } from "@/utils/handleApiError";
import { IntegrationProviderDto } from "@/types";

export default function IntegrationProvidersPage() {
  const [providers, setProviders] = useState<IntegrationProviderDto[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProvider, setSelectedProvider] =
    useState<IntegrationProviderDto | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [isActionLoading, setIsActionLoading] = useState(false);

  const loadProviders = async () => {
    setIsLoading(true);
    try {
      const res = await integrationProviderService.getAll();
      if (res.data.success) setProviders(res.data.data ?? []);
    } catch (e) {
      handleApiError(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadProviders();
  }, []);

  const handleEdit = async (id: string) => {
    try {
      const res = await integrationProviderService.getById(id);
      if (res.data.success) {
        setSelectedProvider(res.data.data);
        setIsModalOpen(true);
      }
    } catch (e) {
      handleApiError(e);
    }
  };

  const handleCreateOrUpdate = async (formData: any) => {
    setIsActionLoading(true);
    try {
      if (selectedProvider) {
        await integrationProviderService.update(selectedProvider.oid, {
          ...formData,
          oid: selectedProvider.oid,
        });
        toast.success("Provider updated successfully");
      } else {
        await integrationProviderService.create(formData);
        toast.success("Provider created successfully");
      }
      setIsModalOpen(false);
      setSelectedProvider(null);
      loadProviders();
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
      const res = await integrationProviderService.delete(deleteTarget);
      if (res.data.data === true) {
        toast.success("Provider deleted");
        loadProviders();
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
      header: "Name",
      accessorKey: "name",
      cell: (info: any) => (
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-indigo-50 text-indigo-600 rounded-md">
            <Plug className="h-4 w-4" />
          </div>
          <span className="font-semibold text-gray-900">
            {info.getValue() || (
              <span className="text-gray-400 italic">Unnamed</span>
            )}
          </span>
        </div>
      ),
    },
    {
      header: "Description",
      accessorKey: "description",
      cell: (info: any) => {
        const val = info.getValue();
        if (!val) return <span className="text-gray-400">—</span>;
        return (
          <span className="text-gray-600 text-sm" title={val}>
            {val.length > 60 ? val.substring(0, 60) + "…" : val}
          </span>
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
            onClick={() => handleEdit(info.row.original.oid)}
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

  if (isLoading && providers.length === 0) {
    return (
      <div className="h-[60vh] flex flex-col items-center justify-center gap-4">
        <Spinner size="lg" />
        <p className="text-gray-500 font-medium">Loading providers...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
      <PageHeader
        title="Integration Providers"
        onAddClick={() => {
          setSelectedProvider(null);
          setIsModalOpen(true);
        }}
        addLabel="Add Provider"
      />

      <Table columns={columns} data={providers} isLoading={isLoading} />

      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedProvider(null);
        }}
        title={selectedProvider ? "Edit Provider" : "Add Integration Provider"}
      >
        <IntegrationProviderForm
          initialData={selectedProvider}
          onSubmit={handleCreateOrUpdate}
          isLoading={isActionLoading}
        />
      </Modal>

      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Delete Provider"
        message="Are you sure you want to delete this integration provider? This action cannot be undone."
        isLoading={isActionLoading}
      />
    </div>
  );
}
