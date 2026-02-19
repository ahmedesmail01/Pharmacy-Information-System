import { useState, useEffect, useCallback } from "react";
import { ShieldCheck, Edit2, Trash2, Search as SearchIcon } from "lucide-react";
import toast from "react-hot-toast";
import PageHeader from "@/components/shared/PageHeader";
import SearchBar from "@/components/shared/SearchBar";
import Table from "@/components/ui/Table";
import Pagination from "@/components/ui/Pagination";
import Badge from "@/components/ui/Badge";
import Modal from "@/components/ui/Modal";
import Button from "@/components/ui/Button";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import RoleForm from "./RoleForm";
import { roleService } from "@/api/roleService";
import { useQueryTable } from "@/hooks/useQuery";
import { handleApiError } from "@/utils/handleApiError";
import { RoleDto, FilterOperation } from "@/types";

export default function RolesPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState<RoleDto | null>(null);
  const [isActionLoading, setIsActionLoading] = useState(false);

  const {
    data,
    isLoading,
    pageNumber,
    setPageNumber,
    totalPages,
    totalRecords,
    fetch,
  } = useQueryTable<RoleDto>({
    service: roleService.query,
    pageSize: 10,
  });

  const loadData = useCallback(() => {
    const filters = searchTerm
      ? [
          {
            propertyName: "roleName",
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
      if (selectedRole) {
        await roleService.update(selectedRole.oid, formData);
        toast.success("Role updated successfully");
      } else {
        await roleService.create(formData);
        toast.success("Role created successfully");
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
    if (!selectedRole) return;
    setIsActionLoading(true);
    try {
      await roleService.delete(selectedRole.oid);
      toast.success("Role deleted successfully");
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
      header: "Role Name",
      accessorKey: "roleName",
      cell: (info: any) => (
        <div className="flex items-center gap-3">
          <div className="p-2 bg-purple-50 text-purple-600 rounded-lg">
            <ShieldCheck className="h-4 w-4" />
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-gray-900">{info.getValue()}</span>
            <span className="text-xs text-gray-400 font-medium">
              {info.row.original.roleNameAr || "---"}
            </span>
          </div>
        </div>
      ),
    },
    {
      header: "Assigned Users",
      accessorKey: "userCount",
      cell: (info: any) => (
        <span className="px-3 py-1 bg-gray-50 text-gray-600 rounded-full text-xs font-bold border border-gray-100">
          {info.getValue() || 0} Users
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
            onClick={() => {
              setSelectedRole(info.row.original);
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
              setSelectedRole(info.row.original);
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
    <div className="max-w-4xl mx-auto space-y-6">
      <PageHeader
        title="Access Control Roles"
        onAddClick={() => {
          setSelectedRole(null);
          setIsFormOpen(true);
        }}
        addLabel="Create Role"
      />

      <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between">
        <SearchBar
          onSearch={setSearchTerm}
          placeholder="Filter roles by name..."
        />
        <div className="text-sm text-gray-500 font-medium">
          Total Roles: <span className="text-gray-900">{totalRecords}</span>
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
        title={selectedRole ? "Edit Access Role" : "Create New Access Role"}
      >
        <RoleForm
          initialData={selectedRole}
          onSubmit={handleCreateOrUpdate}
          isLoading={isActionLoading}
        />
      </Modal>

      <ConfirmDialog
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={handleDelete}
        title="Delete Access Role"
        message={`Are you sure you want to delete the "${selectedRole?.roleName}" role? Users currently assigned to this role might lose access.`}
        isLoading={isActionLoading}
      />
    </div>
  );
}
