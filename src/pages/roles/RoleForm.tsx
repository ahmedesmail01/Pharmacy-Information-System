import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useEffect } from "react";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import { RoleDto } from "@/types";

const roleSchema = z.object({
  roleName: z.string().min(1, "Role name is required").max(50),
  roleNameAr: z.string().optional(),
  status: z.coerce.number().default(1),
});

type RoleFormValues = z.infer<typeof roleSchema>;

interface RoleFormProps {
  initialData?: RoleDto | null;
  onSubmit: (data: RoleFormValues) => void;
  isLoading?: boolean;
}

export default function RoleForm({
  initialData,
  onSubmit,
  isLoading = false,
}: RoleFormProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<RoleFormValues>({
    resolver: zodResolver(roleSchema),
    defaultValues: {
      status: 1,
    },
  });

  useEffect(() => {
    if (initialData) {
      reset({
        roleName: initialData.roleName || "",
        roleNameAr: initialData.roleNameAr || "",
        status: initialData.status ?? 1,
      });
    }
  }, [initialData, reset]);

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="space-y-4">
        <Input
          {...register("roleName")}
          label="Role Name (English)*"
          placeholder="e.g. Administrator"
          error={errors.roleName?.message}
          disabled={isLoading}
        />
        <Input
          {...register("roleNameAr")}
          label="Role Name (Arabic)"
          placeholder="e.g. مدير النظام"
          error={errors.roleNameAr?.message}
          disabled={isLoading}
        />
        <Select
          {...register("status")}
          label="Status"
          options={[
            { value: 1, label: "Active" },
            { value: 0, label: "Inactive" },
          ]}
          disabled={isLoading}
        />
      </div>

      <div className="flex justify-end pt-4">
        <Button
          type="submit"
          isLoading={isLoading}
          className="w-full md:w-auto px-10"
        >
          {initialData ? "Update Role" : "Create Role"}
        </Button>
      </div>
    </form>
  );
}
