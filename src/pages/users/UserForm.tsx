import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useEffect, useState } from "react";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import { useTranslation } from "react-i18next";
import { SystemUserDto, RoleDto, BranchDto } from "@/types";
import { roleService } from "@/api/roleService";
import { branchService } from "@/api/branchService";

interface UserFormProps {
  initialData?: SystemUserDto | null;
  onSubmit: (data: any) => void;
  isLoading?: boolean;
}

export default function UserForm({
  initialData,
  onSubmit,
  isLoading = false,
}: UserFormProps) {
  const { t } = useTranslation("users");
  const tc = useTranslation("common").t;

  const userSchema = z.object({
    username: z.string().min(3, t("usernameMin")).max(50),
    fullName: z.string().min(1, t("fullNameRequired")).max(200),
    email: z.string().email().optional().or(z.literal("")),
    password: z.string().min(6, t("passwordMin")).optional().or(z.literal("")),
    roleId: z.coerce.number().min(1, t("roleRequired")),
    branchId: z.string().min(1, t("branchRequired")),
    status: z.coerce.number().default(1),
  });

  type UserFormValues = z.infer<typeof userSchema>;

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
          label={t("fullName") + "*"}
          placeholder="e.g. John Doe"
          error={errors.fullName?.message}
          disabled={isLoading}
        />
        <Input
          {...register("email")}
          label={t("email")}
          type="email"
          placeholder="e.g. john@example.com"
          error={errors.email?.message}
          disabled={isLoading}
        />
        <Input
          {...register("password")}
          label={initialData ? t("newPassword") : t("password") + "*"}
          type="password"
          placeholder="••••••••"
          error={errors.password?.message}
          disabled={isLoading}
        />
        <Select
          {...register("roleId")}
          label={t("role") + "*"}
          options={roles.map((r) => ({
            value: String(r.status || 0),
            label: r.roleName ?? "",
          }))}
          error={errors.roleId?.message}
          disabled={isLoading}
        />
        <Select
          {...register("branchId")}
          label={t("branch") + "*"}
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
        label={tc("status")}
        options={[
          { value: 1, label: tc("active") },
          { value: 0, label: tc("inactive") },
        ]}
        disabled={isLoading}
      />

      <div className="flex justify-end pt-4">
        <Button
          type="submit"
          isLoading={isLoading}
          className="w-full md:w-auto px-10 shadow-lg shadow-blue-100"
        >
          {initialData ? t("updateUser") : t("createUser")}
        </Button>
      </div>
    </form>
  );
}
