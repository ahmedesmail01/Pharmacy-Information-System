import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useEffect, useState } from "react";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import { SystemUserDto, RoleDto, BranchDto } from "@/types";
import { roleService } from "@/api/roleService";
import { branchService } from "@/api/branchService";

const userSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters").max(50),
  fullName: z.string().min(1, "Full name is required").max(200),
  email: z.string().email().optional().or(z.literal("")),
  password: z
    .string()
    .min(6, "Password must be at least 6 characters")
    .optional()
    .or(z.literal("")),
  roleId: z.coerce.number().min(1, "Role is required"),
  branchId: z.string().min(1, "Branch is required"),
  status: z.coerce.number().default(1),
});

type UserFormValues = z.infer<typeof userSchema>;

interface UserFormProps {
  initialData?: SystemUserDto | null;
  onSubmit: (data: UserFormValues) => void;
  isLoading?: boolean;
}

export default function UserForm({
  initialData,
  onSubmit,
  isLoading = false,
}: UserFormProps) {
  const [roles, setRoles] = useState<RoleDto[]>([]);
  const [branches, setBranches] = useState<BranchDto[]>([]);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<UserFormValues>({
    resolver: zodResolver(userSchema),
    defaultValues: {
      status: 1,
    },
  });

  useEffect(() => {
    const fetchOptions = async () => {
      try {
        const [rRes, bRes] = await Promise.all([
          roleService.getAll(),
          branchService.getAll(),
        ]);
        setRoles(rRes.data.data || []);
        setBranches(bRes.data.data || []);
      } catch (err) {
        console.error("Failed to fetch user options", err);
      }
    };
    fetchOptions();
  }, []);

  useEffect(() => {
    if (initialData) {
      reset({
        username: initialData.username || "",
        fullName: initialData.fullName || "",
        email: initialData.email || "",
        roleId: initialData.roleId,
        branchId: initialData.branchId || "",
        status: initialData.status ?? 1,
        password: "", // Don't populate password
      });
    }
  }, [initialData, reset]);

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Input
          {...register("username")}
          label="Username*"
          placeholder="e.g. jdoe"
          error={errors.username?.message}
          disabled={isLoading || !!initialData}
        />
        <Input
          {...register("fullName")}
          label="Full Name*"
          placeholder="e.g. John Doe"
          error={errors.fullName?.message}
          disabled={isLoading}
        />
        <Input
          {...register("email")}
          label="Email Address"
          type="email"
          placeholder="e.g. john@example.com"
          error={errors.email?.message}
          disabled={isLoading}
        />
        <Input
          {...register("password")}
          label={
            initialData
              ? "New Password (Leave blank to keep current)"
              : "Password*"
          }
          type="password"
          placeholder="••••••••"
          error={errors.password?.message}
          disabled={isLoading}
        />
        <Select
          {...register("roleId")}
          label="System Role*"
          options={roles.map((r) => ({
            value: String(r.status || 0),
            label: r.roleName ?? "",
          }))}
          error={errors.roleId?.message}
          disabled={isLoading}
        />
        <Select
          {...register("branchId")}
          label="Primary Branch*"
          options={branches.map((b) => ({
            value: b.oid,
            label: b.branchName ?? "",
          }))}
          error={errors.branchId?.message}
          disabled={isLoading}
        />
      </div>

      <Select
        {...register("status")}
        label="Account Status"
        options={[
          { value: 1, label: "Active" },
          { value: 0, label: "Inactive" },
        ]}
        disabled={isLoading}
      />

      <div className="flex justify-end pt-4">
        <Button
          type="submit"
          isLoading={isLoading}
          className="w-full md:w-auto px-10 shadow-lg shadow-blue-100"
        >
          {initialData ? "Update User" : "Create User"}
        </Button>
      </div>
    </form>
  );
}
