import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Plus, Settings, List, Edit2, Trash2 } from "lucide-react";
import toast from "react-hot-toast";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import Modal from "@/components/ui/Modal";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import Table from "@/components/ui/Table";
import Spinner from "@/components/ui/Spinner";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import { lookupService } from "@/api/lookupService";
import { handleApiError } from "@/utils/handleApiError";
import { AppLookupMasterDto, AppLookupDetailDto } from "@/types";

export default function LookupDetailPage() {
  const { lookupCode } = useParams();
  const navigate = useNavigate();
  const [master, setMaster] = useState<AppLookupMasterDto | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isActionLoading, setIsActionLoading] = useState(false);

  // Edit/Delete state for details
  const [editDetail, setEditDetail] = useState<AppLookupDetailDto | null>(null);
  const [deleteDetailTarget, setDeleteDetailTarget] = useState<string | null>(
    null,
  );

  // Edit/Delete state for master
  const [isEditMasterOpen, setIsEditMasterOpen] = useState(false);
  const [isDeleteMasterOpen, setIsDeleteMasterOpen] = useState(false);

  const fetchLookup = async () => {
    if (!lookupCode) return;
    setIsLoading(true);
    try {
      const res = await lookupService.getByCode(lookupCode);
      setMaster(res.data.data);
    } catch (err) {
      handleApiError(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLookup();
  }, [lookupCode]);

  // ── Create Detail ────────────────────────────────────────────────────────
  const handleCreateDetail = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!master) return;

    const formData = new FormData(e.currentTarget);
    const data = {
      masterId: master.oid,
      lookupDetailCode: formData.get("detailCode") as string,
      valueNameEn: formData.get("nameEn") as string,
      valueNameAr: formData.get("nameAr") as string,
      status: 1,
    };

    setIsActionLoading(true);
    try {
      await lookupService.createDetail(data);
      toast.success("Lookup option added");
      setIsFormOpen(false);
      fetchLookup();
    } catch (err) {
      handleApiError(err);
    } finally {
      setIsActionLoading(false);
    }
  };

  // ── Update Detail ────────────────────────────────────────────────────────
  const handleUpdateDetail = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!editDetail || !master) return;

    const formData = new FormData(e.currentTarget);
    const data = {
      oid: editDetail.oid,
      lookupMasterID: master.oid,
      valueCode: formData.get("detailCode") as string,
      valueNameEn: formData.get("nameEn") as string,
      valueNameAr: formData.get("nameAr") as string,
      sortOrder: undefined,
      isDefault: false,
      isActive: (formData.get("isActive") as string) === "1",
    };

    setIsActionLoading(true);
    try {
      await lookupService.updateDetail(editDetail.oid, data);
      toast.success("Detail updated");
      setEditDetail(null);
      fetchLookup();
    } catch (err) {
      handleApiError(err);
    } finally {
      setIsActionLoading(false);
    }
  };

  // ── Delete Detail ────────────────────────────────────────────────────────
  const handleDeleteDetail = async () => {
    if (!deleteDetailTarget) return;
    setIsActionLoading(true);
    try {
      const res = await lookupService.deleteDetail(deleteDetailTarget);
      if (res.data.data === true) {
        toast.success("Detail deleted");
        fetchLookup();
      } else {
        toast.error(res.data.message || "Delete failed");
      }
    } catch (err) {
      handleApiError(err);
    } finally {
      setDeleteDetailTarget(null);
      setIsActionLoading(false);
    }
  };

  // ── Update Master ────────────────────────────────────────────────────────
  const handleUpdateMaster = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!master) return;

    const formData = new FormData(e.currentTarget);
    const data = {
      oid: master.oid,
      lookupCode: formData.get("lookupCode") as string,
      lookupNameEn: formData.get("lookupNameEn") as string,
      lookupNameAr: formData.get("lookupNameAr") as string,
      description: (formData.get("description") as string) || undefined,
      isSystem: master.isSystem ?? false,
    };

    setIsActionLoading(true);
    try {
      await lookupService.updateMaster(master.oid, data);
      toast.success("Lookup category updated");
      setIsEditMasterOpen(false);
      fetchLookup();
    } catch (err) {
      handleApiError(err);
    } finally {
      setIsActionLoading(false);
    }
  };

  // ── Delete Master ────────────────────────────────────────────────────────
  const handleDeleteMaster = async () => {
    if (!master) return;
    setIsActionLoading(true);
    try {
      const res = await lookupService.deleteMaster(master.oid);
      if (res.data.data === true) {
        toast.success("Lookup category deleted");
        navigate("/lookups");
      } else {
        toast.error(res.data.message || "Delete failed");
      }
    } catch (err) {
      handleApiError(err);
    } finally {
      setIsDeleteMasterOpen(false);
      setIsActionLoading(false);
    }
  };

  const columns = [
    {
      header: "Detail Code",
      accessorKey: "lookupDetailCode",
      cell: (info: any) => (
        <span className="font-mono text-[10px] font-bold text-gray-400 uppercase tracking-widest">
          {info.getValue()}
        </span>
      ),
    },
    {
      header: "Value (English)",
      accessorKey: "valueNameEn",
      cell: (info: any) => (
        <span className="font-bold text-gray-900">{info.getValue()}</span>
      ),
    },
    {
      header: "Value (Arabic)",
      accessorKey: "valueNameAr",
      cell: (info: any) => (
        <span className="font-medium text-gray-500">
          {info.getValue() || "---"}
        </span>
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
            onClick={() => setEditDetail(info.row.original)}
            className="text-blue-600 h-8 w-8 p-0 hover:bg-blue-50"
          >
            <Edit2 className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setDeleteDetailTarget(info.row.original.oid)}
            className="text-red-600 h-8 w-8 p-0 hover:bg-red-50"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ];

  if (isLoading) {
    return (
      <div className="h-[60vh] flex flex-col items-center justify-center gap-4">
        <Spinner size="lg" />
        <p className="text-gray-500 font-medium">
          Loading lookup configurations...
        </p>
      </div>
    );
  }

  if (!master)
    return <div className="text-center py-12">Lookup category not found</div>;

  return (
    <div className="max-w-full mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
      <div className="flex items-center justify-between">
        <Link to="/lookups">
          <Button
            variant="ghost"
            className="gap-2 text-gray-500 hover:text-gray-900"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Categories
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <Card className="md:col-span-1 h-fit shadow-lg shadow-blue-50/50 border-blue-50">
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-blue-600 rounded-2xl text-white shadow-lg shadow-blue-200">
                <Settings className="h-6 w-6" />
              </div>
              <div>
                <h2 className="font-black text-gray-900 tracking-tight leading-none uppercase text-xs text-gray-400 mb-1">
                  Lookup Category
                </h2>
                <p className="font-bold text-xl">{master.lookupNameEn}</p>
              </div>
            </div>

            <div className="space-y-4 pt-4 border-t border-gray-100">
              <div className="flex flex-col">
                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">
                  Internal Code
                </span>
                <span className="font-mono text-sm bg-gray-50 p-2 rounded border border-gray-100">
                  {master.lookupCode}
                </span>
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">
                  Localized Name
                </span>
                <span className="text-sm font-medium">
                  {master.lookupNameAr || "Not set"}
                </span>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <Button
                onClick={() => setIsFormOpen(true)}
                className="w-full gap-2 shadow-lg shadow-blue-100"
              >
                <Plus className="h-4 w-4" />
                Add Detail Option
              </Button>
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  onClick={() => setIsEditMasterOpen(true)}
                  className="flex-1 gap-1 text-blue-600 hover:bg-blue-50"
                >
                  <Edit2 className="h-3.5 w-3.5" />
                  Edit
                </Button>
                <Button
                  variant="ghost"
                  onClick={() => setIsDeleteMasterOpen(true)}
                  className="flex-1 gap-1 text-red-600 hover:bg-red-50"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  Delete
                </Button>
              </div>
            </div>
          </div>
        </Card>

        <div className="md:col-span-2 space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <List className="h-5 w-5 text-gray-400" />
            <h3 className="font-black text-lg text-gray-900 tracking-tight">
              Available Options
            </h3>
          </div>
          <Table columns={columns} data={master.lookupDetails || []} />

          <div className="flex items-center gap-2 p-4 bg-gray-50 rounded-2xl border border-dashed border-gray-200 italic text-xs text-gray-400">
            <p>
              These options are used system-wide in dropdowns and selectors
              related to this category.
            </p>
          </div>
        </div>
      </div>

      {/* ── Create Detail Modal ──────────────────────────────────────────── */}
      <Modal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        title={`Add Option to ${master.lookupNameEn}`}
      >
        <form onSubmit={handleCreateDetail} className="space-y-6">
          <div className="space-y-4">
            <Input
              name="detailCode"
              label="Option Code (Uppercase)*"
              placeholder="e.g. TYPE_RX"
              required
            />
            <Input
              name="nameEn"
              label="Name (English)*"
              placeholder="e.g. Prescription Drug"
              required
            />
            <Input
              name="nameAr"
              label="Name (Arabic)"
              placeholder="e.g. دواء بوصفة"
            />
          </div>
          <div className="flex justify-end pt-4">
            <Button
              type="submit"
              isLoading={isActionLoading}
              className="w-full shadow-lg shadow-blue-100"
            >
              Save Option
            </Button>
          </div>
        </form>
      </Modal>

      {/* ── Edit Detail Modal ───────────────────────────────────────────── */}
      <Modal
        isOpen={!!editDetail}
        onClose={() => setEditDetail(null)}
        title="Edit Detail Option"
      >
        <form onSubmit={handleUpdateDetail} className="space-y-6">
          <div className="space-y-4">
            <Input
              name="detailCode"
              label="Option Code*"
              defaultValue={editDetail?.lookupDetailCode || ""}
              required
            />
            <Input
              name="nameEn"
              label="Name (English)*"
              defaultValue={editDetail?.valueNameEn || ""}
              required
            />
            <Input
              name="nameAr"
              label="Name (Arabic)"
              defaultValue={editDetail?.valueNameAr || ""}
            />
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Active
              </label>
              <select
                name="isActive"
                defaultValue={editDetail?.isActive === false ? "0" : "1"}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              >
                <option value="1">Active</option>
                <option value="0">Inactive</option>
              </select>
            </div>
          </div>
          <div className="flex justify-end pt-4">
            <Button
              type="submit"
              isLoading={isActionLoading}
              className="w-full shadow-lg shadow-blue-100"
            >
              Update Option
            </Button>
          </div>
        </form>
      </Modal>

      {/* ── Delete Detail Confirm ────────────────────────────────────────── */}
      <ConfirmDialog
        isOpen={!!deleteDetailTarget}
        onClose={() => setDeleteDetailTarget(null)}
        onConfirm={handleDeleteDetail}
        title="Delete Detail"
        message="Are you sure you want to delete this lookup detail? This action cannot be undone."
        isLoading={isActionLoading}
      />

      {/* ── Edit Master Modal ────────────────────────────────────────────── */}
      <Modal
        isOpen={isEditMasterOpen}
        onClose={() => setIsEditMasterOpen(false)}
        title="Edit Lookup Category"
      >
        <form onSubmit={handleUpdateMaster} className="space-y-6">
          <div className="space-y-4">
            <Input
              name="lookupCode"
              label="Lookup Code*"
              defaultValue={master.lookupCode}
              required
            />
            <Input
              name="lookupNameEn"
              label="Name (English)*"
              defaultValue={master.lookupNameEn || ""}
              required
            />
            <Input
              name="lookupNameAr"
              label="Name (Arabic)*"
              defaultValue={master.lookupNameAr || ""}
              required
            />
            <Input
              name="description"
              label="Description"
              defaultValue={master.description || ""}
            />
          </div>
          <div className="flex justify-end pt-4">
            <Button
              type="submit"
              isLoading={isActionLoading}
              className="w-full shadow-lg shadow-blue-100"
            >
              Update Category
            </Button>
          </div>
        </form>
      </Modal>

      {/* ── Delete Master Confirm ────────────────────────────────────────── */}
      <ConfirmDialog
        isOpen={isDeleteMasterOpen}
        onClose={() => setIsDeleteMasterOpen(false)}
        onConfirm={handleDeleteMaster}
        title="Delete Lookup Category"
        message={`Are you sure you want to delete "${master.lookupNameEn}" and all its details? This action cannot be undone.`}
        isLoading={isActionLoading}
      />
    </div>
  );
}
