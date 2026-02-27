import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import { stockService } from "@/api/stockService";
import { branchService } from "@/api/branchService";
import { productService } from "@/api/productService";
import { useTranslation } from "react-i18next";
import { stakeholderService } from "@/api/stakeholderService";
import { handleApiError } from "@/utils/handleApiError";
import {
  BranchDto,
  ProductDto,
  StakeholderDto,
  CreateStockInDto,
} from "@/types";

export default function StockInForm({ onSuccess }: { onSuccess: () => void }) {
  const { t } = useTranslation("stock");
  const tc = useTranslation("common").t;

  const stockInSchema = z.object({
    branchId: z.string().min(1, t("branch_required")),
    productId: z.string().min(1, t("product_required")),
    supplierId: z.string().optional(),
    quantity: z.coerce.number().min(1, t("quantity_min")),
    unitCost: z.coerce.number().min(0, t("unit_cost_required")),
    batchNumber: z.string().optional(),
    expiryDate: z.string().optional(),
    referenceNumber: z.string().optional(),
  });

  type StockInFormValues = z.infer<typeof stockInSchema>;

  const [branches, setBranches] = useState<BranchDto[]>([]);
  const [products, setProducts] = useState<ProductDto[]>([]);
  const [suppliers, setSuppliers] = useState<StakeholderDto[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<StockInFormValues>({
    resolver: zodResolver(stockInSchema),
    defaultValues: {
      quantity: 1,
      unitCost: 0,
    },
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [bRes, pRes, sRes] = await Promise.all([
          branchService.getAll(),
          productService.getAll(),
          stakeholderService.getAll({ stakeholderTypeCode: "VENDOR" }),
        ]);
        setBranches(bRes.data.data || []);
        setProducts(pRes.data.data || []);
        const rawSuppliers = sRes.data.data || [];
        setSuppliers(
          rawSuppliers.map((s: any) => ({
            ...s,
            fullName: s.fullName || s.name || "",
          })),
        );
      } catch (err) {
        console.error("Failed to fetch stock in data", err);
      }
    };
    fetchData();
  }, []);

  const onSubmit = async (formData: StockInFormValues) => {
    setIsLoading(true);
    try {
      const dto: CreateStockInDto = {
        ...formData,
        branchId: formData.branchId,
        productId: formData.productId,
        quantity: formData.quantity,
        unitCost: formData.unitCost,
      };
      await stockService.stockIn(dto);
      toast.success(t("stock_in_success"));
      reset();
      onSuccess();
    } catch (err) {
      handleApiError(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="grid grid-cols-1 md:grid-cols-2 gap-6 p-1"
    >
      <Select
        {...register("branchId")}
        label={t("destination_branch") + "*"}
        options={branches.map((b) => ({
          value: b.oid,
          label: b.branchName ?? "",
        }))}
        error={errors.branchId?.message}
        disabled={isLoading}
      />
      <Select
        {...register("productId")}
        label={t("product") + "*"}
        options={products.map((p) => ({ value: p.oid, label: p.drugName }))}
        error={errors.productId?.message}
        disabled={isLoading}
      />
      <Select
        {...register("supplierId")}
        label={t("supplier")}
        options={suppliers.map((s) => ({ value: s.oid, label: s.fullName }))}
        error={errors.supplierId?.message}
        disabled={isLoading}
      />
      <div className="grid grid-cols-2 gap-4">
        <Input
          {...register("quantity")}
          label={t("quantity_received") + "*"}
          type="number"
          error={errors.quantity?.message}
          disabled={isLoading}
        />
        <Input
          {...register("unitCost")}
          label={t("unit_cost") + "*"}
          type="number"
          step="0.01"
          error={errors.unitCost?.message}
          disabled={isLoading}
        />
      </div>
      <Input
        {...register("batchNumber")}
        label={t("batch_number")}
        placeholder="e.g. BATCH-2024-X"
        error={errors.batchNumber?.message}
        disabled={isLoading}
      />
      <Input
        {...register("expiryDate")}
        label={t("expiry_date")}
        type="date"
        error={errors.expiryDate?.message}
        disabled={isLoading}
      />
      <Input
        {...register("referenceNumber")}
        label={t("reference_number")}
        placeholder="PO-12345"
        error={errors.referenceNumber?.message}
        disabled={isLoading}
      />
      <div className="md:col-span-2 flex justify-end pt-4 border-t border-gray-50">
        <Button
          type="submit"
          isLoading={isLoading}
          className="w-full md:w-auto px-12 h-12 shadow-lg shadow-green-100 bg-green-600 hover:bg-green-700"
        >
          {t("confirm_receipt")}
        </Button>
      </div>
    </form>
  );
}
