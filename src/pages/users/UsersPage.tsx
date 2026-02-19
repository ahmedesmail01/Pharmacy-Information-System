import { useState, useEffect, useCallback } from "react";
import {
  Users as UsersIcon,
  Edit2,
  Trash2,
  Mail,
  Shield,
  MapPin,
} from "lucide-react";
import toast from "react-hot-toast";
import PageHeader from "@/components/shared/PageHeader";
import SearchBar from "@/components/shared/SearchBar";
import Table from "@/components/ui/Table";
import Pagination from "@/components/ui/Pagination";
import Badge from "@/components/ui/Badge";
import Modal from "@/components/ui/Modal";
import Button from "@/components/ui/Button";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import UserForm from "./UserForm";
import { systemUserService } from "@/api/systemUserService";
import { useQueryTable } from "@/hooks/useQuery";
import { handleApiError } from "@/utils/handleApiError";
import { SystemUserDto, FilterOperation } from "@/types";

export default function UsersPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<SystemUserDto | null>(null);
  const [isActionLoading, setIsActionLoading] = useState(false);

  const {
    data,
    isLoading,
    pageNumber,
    setPageNumber,
    totalPages,
    totalRecords,
    fetch,
  } = useQueryTable<SystemUserDto>({
    service: systemUserService.query,
    pageSize: 10,
  });

  const loadData = useCallback(() => {
    const filters = searchTerm
      ? [
          {
            propertyName: "fullName",
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
      if (selectedUser) {
        await systemUserService.update(selectedUser.oid, formData);
        toast.success("User updated successfully");
      } else {
        await systemUserService.create(formData);
        toast.success("User created successfully");
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
    if (!selectedUser) return;
    setIsActionLoading(true);
    try {
      await systemUserService.delete(selectedUser.oid);
      toast.success("User deleted successfully");
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
      header: "User",
      accessorKey: "fullName",
      cell: (info: any) => (
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold">
            {info.getValue()?.charAt(0)}
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-gray-900">{info.getValue()}</span>
            <span className="text-xs text-gray-400 font-medium tracking-tight">
              @{info.row.original.username}
            </span>
          </div>
        </div>
      ),
    },
    {
      header: "Role",
      accessorKey: "roleName",
      cell: (info: any) => (
        <Badge className="bg-purple-50 text-purple-700 border border-purple-100">
          <Shield className="h-3 w-3 mr-1" />
          {info.getValue()}
        </Badge>
      ),
    },
    {
      header: "Branch",
      accessorKey: "branchName",
      cell: (info: any) => (
        <div className="flex items-center gap-1.5 text-gray-500 text-sm">
          <MapPin className="h-3.5 w-3.5" />
          {info.getValue() || "Universal Access"}
        </div>
      ),
    },
    {
      header: "Email",
      accessorKey: "email",
      cell: (info: any) => (
        <div className="flex items-center gap-1.5 text-xs text-gray-400">
          <Mail className="h-3 w-3" />
          {info.getValue() || "---"}
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
              setSelectedUser(info.row.original);
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
              setSelectedUser(info.row.original);
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
        title="System Access Management"
        onAddClick={() => {
          setSelectedUser(null);
          setIsFormOpen(true);
        }}
        addLabel="Create User"
      />

      <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between">
        <SearchBar
          onSearch={setSearchTerm}
          placeholder="Filter by name or username..."
        />
        <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-100">
          Global Accounts: <span className="text-gray-900">{totalRecords}</span>
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
          selectedUser
            ? `Manage Account: ${selectedUser.username}`
            : "Register New User"
        }
        size="lg"
      >
        <UserForm
          initialData={selectedUser}
          onSubmit={handleCreateOrUpdate}
          isLoading={isActionLoading}
        />
      </Modal>

      <ConfirmDialog
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={handleDelete}
        title="Revoke Access"
        message={`Are you sure you want to delete the account for "${selectedUser?.fullName}"? This will immediately revoke their access to the system.`}
        isLoading={isActionLoading}
      />
    </div>
  );
}
