import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { ArrowRight } from "lucide-react";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import { stockService } from "@/api/stockService";
import { branchService } from "@/api/branchService";
import { productService } from "@/api/productService";
import { handleApiError } from "@/utils/handleApiError";
import { useTranslation } from "react-i18next";
import { BranchDto, ProductDto, CreateStockTransferDto } from "@/types";

export default function StockTransferForm({
  onSuccess,
}: {
  onSuccess: () => void;
}) {
  const { t } = useTranslation("stock");
  const tc = useTranslation("common").t;

  const transferSchema = z
    .object({
      fromBranchId: z.string().min(1, t("source_branch_required")),
      toBranchId: z.string().min(1, t("destination_branch_required")),
      productId: z.string().min(1, t("product_required")),
      quantity: z.coerce.number().min(0.01, t("quantity_min")),
      batchNumber: z.string().optional(),
      referenceNumber: z.string().optional(),
    })
    .refine((data) => data.fromBranchId !== data.toBranchId, {
      message: t("transfer_same_branch_error"),
      path: ["toBranchId"],
    });

  type TransferFormValues = z.infer<typeof transferSchema>;

  const [branches, setBranches] = useState<BranchDto[]>([]);
  const [products, setProducts] = useState<ProductDto[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<TransferFormValues>({
    resolver: zodResolver(transferSchema),
    defaultValues: {
      quantity: 1,
    },
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [bRes, pRes] = await Promise.all([
          branchService.getAll(),
          productService.getAll(),
        ]);
        setBranches(bRes.data.data || []);
        setProducts(pRes.data.data || []);
      } catch (err) {
        console.error("Failed to fetch transfer data", err);
      }
    };
    fetchData();
  }, []);

  const onSubmit = async (formData: TransferFormValues) => {
    setIsLoading(true);
    try {
      await stockService.transfer(formData as CreateStockTransferDto);
      toast.success(t("transfer_success"));
      reset();
      onSuccess();
    } catch (err) {
      handleApiError(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8 p-1">
      <div className="flex flex-col md:flex-row items-center gap-6 p-6 bg-gray-50 rounded-3xl border border-gray-100">
        <div className="flex-1 w-full">
          <Select
            {...register("fromBranchId")}
            label={t("source_branch") + "*"}
            options={branches.map((b) => ({
              value: b.oid,
              label: b.branchName ?? "",
            }))}
            error={errors.fromBranchId?.message}
            disabled={isLoading}
          />
        </div>
        <div className="p-3 bg-white rounded-full shadow-sm">
          <ArrowRight className="h-6 w-6 text-blue-500" />
        </div>
        <div className="flex-1 w-full">
          <Select
            {...register("toBranchId")}
            label={t("destination_branch") + "*"}
            options={branches.map((b) => ({
              value: b.oid,
              label: b.branchName ?? "",
            }))}
            error={errors.toBranchId?.message}
            disabled={isLoading}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Select
          {...register("productId")}
          label={t("product_to_transfer") + "*"}
          options={products.map((p) => ({ value: p.oid, label: p.drugName }))}
          error={errors.productId?.message}
          disabled={isLoading}
        />
        <Input
          {...register("quantity")}
          label={t("qty") + "*"}
          type="number"
          step="0.01"
          error={errors.quantity?.message}
          disabled={isLoading}
        />
        <Input
          {...register("batchNumber")}
          label={t("batch_number")}
          placeholder="e.g. BATCH-2024-X"
          error={errors.batchNumber?.message}
          disabled={isLoading}
        />
        <Input
          {...register("referenceNumber")}
          label={t("transfer_reference")}
          placeholder="TRF-001"
          error={errors.referenceNumber?.message}
          disabled={isLoading}
        />
      </div>

      <div className="flex justify-end pt-4 border-t border-gray-50">
        <Button
          type="submit"
          isLoading={isLoading}
          className="w-full md:w-auto px-12 h-12 shadow-lg shadow-blue-100 bg-blue-600 hover:bg-blue-700"
        >
          {t("confirm_transfer")}
        </Button>
      </div>
    </form>
  );
}
