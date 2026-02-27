import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useEffect, useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import { useTranslation } from "react-i18next";
import { BranchIntegrationSettingDto, IntegrationProviderDto } from "@/types";

type SettingFormValues = z.infer<ReturnType<typeof getSettingSchema>>;

const getSettingSchema = (t: any) =>
  z.object({
    integrationProviderId: z.string().min(1, t("providerRequired")),
    branchId: z.string().min(1, t("branchRequired")),
    integrationKey: z.string().optional(),
    integrationValue: z.string().optional(),
    status: z.coerce.number().default(1),
  });

interface BranchIntegrationFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  selectedBranchId: string;
  editItem?: BranchIntegrationSettingDto | null;
  providers: IntegrationProviderDto[];
  onSubmit: (data: SettingFormValues) => void;
  isLoading?: boolean;
}

export default function BranchIntegrationForm({
  editItem,
  selectedBranchId,
  providers,
  onSubmit,
  isLoading = false,
}: BranchIntegrationFormProps) {
  const { t } = useTranslation("integrations");
  const tc = useTranslation("common").t;
  const [showValue, setShowValue] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<SettingFormValues>({
    resolver: zodResolver(getSettingSchema(t)),
    defaultValues: {
      branchId: selectedBranchId,
      status: 1,
    },
  });

  useEffect(() => {
    if (editItem) {
      reset({
        integrationProviderId: editItem.integrationProviderId || "",
        branchId: editItem.branchId || selectedBranchId,
        integrationKey: editItem.integrationKey || "",
        integrationValue: editItem.integrationValue || "",
        status: editItem.status ?? 1,
      });
    } else {
      reset({
        integrationProviderId: "",
        branchId: selectedBranchId,
        integrationKey: "",
        integrationValue: "",
        status: 1,
      });
    }
    setShowValue(false);
  }, [editItem, selectedBranchId, reset]);

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <input type="hidden" {...register("branchId")} />

      <Select
        {...register("integrationProviderId")}
        label={t("integrationProvider") + "*"}
        options={providers.map((p) => ({
          value: p.oid,
          label: p.name || "Unnamed Provider",
        }))}
        error={errors.integrationProviderId?.message}
        disabled={isLoading || !!editItem}
      />

      <Input
        {...register("integrationKey")}
        label={t("integrationKey")}
        placeholder={t("integrationKeyPlaceholder")}
        error={errors.integrationKey?.message}
        disabled={isLoading}
      />

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {t("integrationValue")}
        </label>
        <div className="relative">
          <input
            {...register("integrationValue")}
            type={showValue ? "text" : "password"}
            placeholder={t("integrationValuePlaceholder")}
            disabled={isLoading}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white disabled:opacity-50 disabled:cursor-not-allowed"
          />
          <button
            type="button"
            onClick={() => setShowValue(!showValue)}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
          >
            {showValue ? (
              <EyeOff className="h-4 w-4" />
            ) : (
              <Eye className="h-4 w-4" />
            )}
          </button>
        </div>
      </div>

      <Select
        {...register("status")}
        label={tc("status")}
        options={[
          { value: 1, label: tc("active") },
          { value: 0, label: tc("inactive") },
        ]}
        error={errors.status?.message}
        disabled={isLoading}
      />

      <div className="flex justify-end gap-3 mt-8">
        <Button
          type="submit"
          isLoading={isLoading}
          className="w-full md:w-auto px-10"
        >
          {editItem ? t("updateSetting") : t("createSetting")}
        </Button>
      </div>
    </form>
  );
}
