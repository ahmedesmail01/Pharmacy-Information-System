import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useEffect, useState } from "react";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import { useTranslation } from "react-i18next";
import { StoreDto, BranchDto } from "@/types";
import { branchService } from "@/api/branchService";

const storeSchema = z.object({
  storeCode: z.string().min(1, "Store code is required"),
  storeName: z.string().min(1, "Store name is required").max(100),
  description: z.string().optional(),
  address: z.string().optional(),
  phoneNumber: z.string().optional(),
  isActive: z.boolean().default(true),
  branchId: z.string().min(1, "Branch is required"),
  status: z.coerce.number().default(1),
});

type StoreFormValues = z.infer<typeof storeSchema>;

interface StoreFormProps {
  initialData?: StoreDto | null;
  onSubmit: (data: StoreFormValues) => void;
  isLoading?: boolean;
}

export default function StoreForm({
  initialData,
  onSubmit,
  isLoading = false,
}: StoreFormProps) {
  const { t } = useTranslation("stores");
  const tc = useTranslation("common").t;
  const [branches, setBranches] = useState<BranchDto[]>([]);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<StoreFormValues>({
    resolver: zodResolver(storeSchema),
    defaultValues: {
      isActive: true,
      status: 1,
    },
  });

  useEffect(() => {
    const fetchBranches = async () => {
      try {
        const res = await branchService.query({
          request: {
            pagination: { getAll: true, pageNumber: 1, pageSize: 100 },
          },
        });
        setBranches(res.data.data.data || []);
      } catch (err) {
        console.error("Failed to fetch branches", err);
      }
    };
    fetchBranches();
  }, []);

  useEffect(() => {
    if (initialData) {
      reset({
        storeCode: initialData.storeCode || "",
        storeName: initialData.storeName || "",
        description: initialData.description || "",
        address: initialData.address || "",
        phoneNumber: initialData.phoneNumber || "",
        isActive: initialData.isActive ?? true,
        branchId: initialData.branchId || "",
        status: initialData.status ?? 1,
      });
    } else {
      reset({
        storeCode: "",
        storeName: "",
        description: "",
        address: "",
        phoneNumber: "",
        isActive: true,
        branchId: "",
        status: 1,
      });
    }
  }, [initialData, reset]);

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          {...register("storeName")}
          label={t("storeName") + "*"}
          placeholder="e.g. Main Store"
          error={errors.storeName?.message}
          disabled={isLoading}
        />
        <Input
          {...register("storeCode")}
          label={t("storeCode") + "*"}
          placeholder="e.g. ST-001"
          error={errors.storeCode?.message}
          disabled={isLoading}
        />
      </div>

      <Select
        {...register("branchId")}
        label={t("branch") + "*"}
        options={branches.map((b) => ({
          value: b.oid,
          label: b.branchName,
        }))}
        error={errors.branchId?.message}
        disabled={isLoading}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          {...register("phoneNumber")}
          label={t("phoneNumber")}
          placeholder="e.g. +966..."
          error={errors.phoneNumber?.message}
          disabled={isLoading}
        />
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
      </div>

      <Input
        {...register("address")}
        label={t("address")}
        placeholder="Store location..."
        error={errors.address?.message}
        disabled={isLoading}
      />

      <Input
        {...register("description")}
        label={t("description")}
        placeholder="Optional description..."
        error={errors.description?.message}
        disabled={isLoading}
      />

      <div className="flex items-center gap-2 py-2">
        <input
          type="checkbox"
          {...register("isActive")}
          id="isActive"
          className="h-4 w-4 text-blue-600 rounded"
          disabled={isLoading}
        />
        <label htmlFor="isActive" className="text-sm font-medium text-gray-700">
          {t("isActive")}
        </label>
      </div>

      <div className="flex justify-end gap-3 mt-8">
        <Button
          type="submit"
          isLoading={isLoading}
          className="w-full md:w-auto px-10"
        >
          {initialData ? t("editStore") : t("addStore")}
        </Button>
      </div>
    </form>
  );
}
