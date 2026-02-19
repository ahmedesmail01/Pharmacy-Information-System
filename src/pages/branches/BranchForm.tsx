import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useEffect } from "react";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import { BranchDto, CreateBranchDto } from "@/types";

const branchSchema = z.object({
  branchCode: z.string().optional(),
  branchName: z.string().min(1, "Branch name is required").max(100),
  gln: z.string().optional(),
  city: z.string().optional(),
  district: z.string().optional(),
  address: z.string().optional(),
  status: z.coerce.number().default(1),
});

type BranchFormValues = z.infer<typeof branchSchema>;

interface BranchFormProps {
  initialData?: BranchDto | null;
  onSubmit: (data: BranchFormValues) => void;
  isLoading?: boolean;
}

export default function BranchForm({
  initialData,
  onSubmit,
  isLoading = false,
}: BranchFormProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<BranchFormValues>({
    resolver: zodResolver(branchSchema),
    defaultValues: {
      status: 1,
    },
  });

  useEffect(() => {
    if (initialData) {
      reset({
        branchCode: initialData.branchCode || "",
        branchName: initialData.branchName || "",
        gln: initialData.gln || "",
        city: initialData.city || "",
        district: initialData.district || "",
        address: initialData.address || "",
        status: initialData.status ?? 1,
      });
    } else {
      reset({
        branchCode: "",
        branchName: "",
        gln: "",
        city: "",
        district: "",
        address: "",
        status: 1,
      });
    }
  }, [initialData, reset]);

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          {...register("branchName")}
          label="Branch Name*"
          placeholder="e.g. Main Branch"
          error={errors.branchName?.message}
          disabled={isLoading}
        />
        <Input
          {...register("branchCode")}
          label="Branch Code"
          placeholder="e.g. BR-001"
          error={errors.branchCode?.message}
          disabled={isLoading}
        />
      </div>

      <Input
        {...register("gln")}
        label="GLN (Global Location Number)"
        placeholder="13-digit number"
        error={errors.gln?.message}
        disabled={isLoading}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          {...register("city")}
          label="City"
          placeholder="e.g. Riyadh"
          error={errors.city?.message}
          disabled={isLoading}
        />
        <Input
          {...register("district")}
          label="District"
          placeholder="e.g. Al-Olaya"
          error={errors.district?.message}
          disabled={isLoading}
        />
      </div>

      <Input
        {...register("address")}
        label="Full Address"
        placeholder="Street name, building number..."
        error={errors.address?.message}
        disabled={isLoading}
      />

      <Select
        {...register("status")}
        label="Status"
        options={[
          { value: 1, label: "Active" },
          { value: 0, label: "Inactive" },
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
          {initialData ? "Update Branch" : "Create Branch"}
        </Button>
      </div>
    </form>
  );
}
