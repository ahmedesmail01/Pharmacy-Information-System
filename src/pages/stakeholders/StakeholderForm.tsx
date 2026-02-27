import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useEffect, useState } from "react";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import { useTranslation } from "react-i18next";
import { StakeholderDto, AppLookupDetailDto } from "@/types";
import { lookupService } from "@/api/lookupService";

interface StakeholderFormProps {
  initialData?: StakeholderDto | null;
  onSubmit: (data: any) => void;
  isLoading?: boolean;
}

export default function StakeholderForm({
  initialData,
  onSubmit,
  isLoading = false,
}: StakeholderFormProps) {
  const { t } = useTranslation("stakeholders");
  const tc = useTranslation("common").t;

  const stakeholderSchema = z.object({
    fullName: z.string().min(1, t("fullNameRequired")).max(200),
    stakeholderTypeCode: z.string().min(1, t("typeRequired")),
    email: z.string().email().optional().or(z.literal("")),
    phoneNumber: z.string().optional(),
    address: z.string().optional(),
    taxNumber: z.string().optional(),
    crNumber: z.string().optional(),
    status: z.coerce.number().default(1),
  });

  type StakeholderFormValues = z.infer<typeof stakeholderSchema>;

  const [types, setTypes] = useState<AppLookupDetailDto[]>([]);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<StakeholderFormValues>({
    resolver: zodResolver(stakeholderSchema),
    defaultValues: {
      status: 1,
    },
  });

  useEffect(() => {
    const fetchTypes = async () => {
      try {
        const res = await lookupService.getByCode("STAKEHOLDER_TYPE");
        setTypes(res.data.data?.lookupDetails || []);
      } catch (err) {
        console.error("Failed to fetch stakeholder types", err);
      }
    };
    fetchTypes();
  }, []);

  useEffect(() => {
    if (initialData) {
      reset({
        fullName: initialData.name || "",
        stakeholderTypeCode: initialData.stakeholderTypeCode || "",
        email: initialData.email || "",
        phoneNumber: initialData.phoneNumber || initialData.phone || "",
        address: initialData.address || "",
        taxNumber: initialData.taxNumber || "",
        crNumber: initialData.crNumber || "",
        status: initialData.status ?? 1,
      });
    }
  }, [initialData, reset]);

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Input
          {...register("fullName")}
          label={t("fullName") + "*"}
          placeholder="e.g. John Doe or Pfizer Inc."
          error={errors.fullName?.message}
          disabled={isLoading}
        />
        <Select
          {...register("stakeholderTypeCode")}
          label={t("type") + "*"}
          options={types.map((t) => ({
            value: t.lookupDetailCode,
            label: t.valueNameEn ?? "",
          }))}
          error={errors.stakeholderTypeCode?.message}
          disabled={isLoading}
        />
        <Input
          {...register("email")}
          label={t("email")}
          type="email"
          placeholder="e.g. contact@example.com"
          error={errors.email?.message}
          disabled={isLoading}
        />
        <Input
          {...register("phoneNumber")}
          label={t("phoneNumber")}
          placeholder="e.g. +966..."
          error={errors.phoneNumber?.message}
          disabled={isLoading}
        />
      </div>

      <Input
        {...register("address")}
        label={t("address")}
        placeholder="Full street address..."
        error={errors.address?.message}
        disabled={isLoading}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Input
          {...register("taxNumber")}
          label={t("taxNumber")}
          placeholder="e.g. 300123456700003"
          error={errors.taxNumber?.message}
          disabled={isLoading}
        />
        <Input
          {...register("crNumber")}
          label={t("crNumber")}
          placeholder="e.g. 1010123456"
          error={errors.crNumber?.message}
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
          className="px-10 shadow-lg shadow-blue-100"
        >
          {initialData ? t("updateStakeholder") : t("addStakeholder")}
        </Button>
      </div>
    </form>
  );
}
