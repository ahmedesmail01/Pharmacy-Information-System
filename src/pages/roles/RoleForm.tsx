import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useEffect } from "react";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import { useTranslation } from "react-i18next";
import { RoleDto } from "@/types";

interface RoleFormProps {
  initialData?: RoleDto | null;
  onSubmit: (data: any) => void;
  isLoading?: boolean;
}

export default function RoleForm({
  initialData,
  onSubmit,
  isLoading = false,
}: RoleFormProps) {
  const { t } = useTranslation("roles");
  const tc = useTranslation("common").t;

  const roleSchema = z.object({
    roleName: z.string().min(1, t("roleNameRequired")).max(50),
    roleNameAr: z.string().optional(),
    status: z.coerce.number().default(1),
  });

  type RoleFormValues = z.infer<typeof roleSchema>;

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
          label={t("roleName") + " (English)*"}
          placeholder="e.g. Administrator"
          error={errors.roleName?.message}
          disabled={isLoading}
        />
        <Input
          {...register("roleNameAr")}
          label={t("roleName") + " (Arabic)"}
          placeholder="e.g. مدير النظام"
          error={errors.roleNameAr?.message}
          disabled={isLoading}
        />
        <Select
          {...register("status")}
          label={tc("status")}
          options={[
            { value: 1, label: tc("active") },
            { value: 0, label: tc("inactive") },
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
          {initialData ? t("updateRole") : t("createRole")}
        </Button>
      </div>
    </form>
  );
}
