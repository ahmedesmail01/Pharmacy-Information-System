import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useEffect, useState } from "react";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import { StakeholderDto, AppLookupDetailDto } from "@/types";
import { lookupService } from "@/api/lookupService";

const stakeholderSchema = z.object({
  fullName: z.string().min(1, "Full name is required").max(200),
  stakeholderTypeCode: z.string().min(1, "Stakeholder type is required"),
  email: z.string().email().optional().or(z.literal("")),
  phoneNumber: z.string().optional(),
  address: z.string().optional(),
  taxNumber: z.string().optional(),
  crNumber: z.string().optional(),
  status: z.coerce.number().default(1),
});

type StakeholderFormValues = z.infer<typeof stakeholderSchema>;

interface StakeholderFormProps {
  initialData?: StakeholderDto | null;
  onSubmit: (data: StakeholderFormValues) => void;
  isLoading?: boolean;
}

export default function StakeholderForm({
  initialData,
  onSubmit,
  isLoading = false,
}: StakeholderFormProps) {
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
        fullName: initialData.fullName || "",
        stakeholderTypeCode: initialData.stakeholderTypeCode || "",
        email: initialData.email || "",
        phoneNumber: initialData.phoneNumber || "",
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
          label="Full Name / Company Name*"
          placeholder="e.g. John Doe or Pfizer Inc."
          error={errors.fullName?.message}
          disabled={isLoading}
        />
        <Select
          {...register("stakeholderTypeCode")}
          label="Stakeholder Type*"
          options={types.map((t) => ({
            value: t.lookupDetailCode,
            label: t.valueNameEn ?? "",
          }))}
          error={errors.stakeholderTypeCode?.message}
          disabled={isLoading}
        />
        <Input
          {...register("email")}
          label="Email Address"
          type="email"
          placeholder="e.g. contact@example.com"
          error={errors.email?.message}
          disabled={isLoading}
        />
        <Input
          {...register("phoneNumber")}
          label="Phone Number"
          placeholder="e.g. +966..."
          error={errors.phoneNumber?.message}
          disabled={isLoading}
        />
      </div>

      <Input
        {...register("address")}
        label="Address"
        placeholder="Full street address..."
        error={errors.address?.message}
        disabled={isLoading}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Input
          {...register("taxNumber")}
          label="Tax / VAT Number"
          placeholder="e.g. 300123456700003"
          error={errors.taxNumber?.message}
          disabled={isLoading}
        />
        <Input
          {...register("crNumber")}
          label="CR Number"
          placeholder="e.g. 1010123456"
          error={errors.crNumber?.message}
          disabled={isLoading}
        />
      </div>

      <Select
        {...register("status")}
        label="Status"
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
          className="px-10 shadow-lg shadow-blue-100"
        >
          {initialData ? "Update Stakeholder" : "Add Stakeholder"}
        </Button>
      </div>
    </form>
  );
}
