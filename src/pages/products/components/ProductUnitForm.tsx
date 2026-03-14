import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslation } from "react-i18next";
import { getProductUnitSchema, ProductUnitFormValues } from "../schema";
import { useUpsertProductUnit } from "@/hooks/queries/useProducts";
import { useEffect } from "react";
import { ProductUnitDto } from "@/types";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import Button from "@/components/ui/Button";
import { useLookup } from "@/context/LookupContext";
import { getUniqueOptions } from "@/utils/lookupUtils";
import { positiveNumberInputProps } from "@/utils/positiveNumberInputProps";
import { X } from "lucide-react";

interface ProductUnitFormProps {
  productId: string;
  initialData?: ProductUnitDto | null;
  onCancel: () => void;
  onSuccess?: () => void;
}

export default function ProductUnitForm({
  productId,
  initialData,
  onCancel,
  onSuccess,
}: ProductUnitFormProps) {
  const { t } = useTranslation("products");
  const { getLookupDetails } = useLookup();
  const packageTypes = getLookupDetails("PACKAGE_TYPE");

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<ProductUnitFormValues>({
    resolver: zodResolver(getProductUnitSchema(t)),
    defaultValues: {
      productId,
      conversionFactor: 1,
      price: 0,
    },
  });

  const upsertMutation = useUpsertProductUnit(productId);

  useEffect(() => {
    if (initialData) {
      reset({
        oid: initialData.oid,
        productId: initialData.productId,
        packageTypeId: initialData.packageTypeId,
        conversionFactor: initialData.conversionFactor,
        price: initialData.price,
        barcode: initialData.barcode,
      });
    } else {
      reset({
        productId,
        conversionFactor: 1,
        price: 0,
        barcode: null,
      });
    }
  }, [initialData, productId, reset]);

  const onSubmit = (data: ProductUnitFormValues) => {
    // Explicit casting to match mutationFn expected types
    upsertMutation.mutate(data as any, {
      onSuccess: () => {
        onCancel();
        onSuccess?.();
      },
    });
  };

  return (
    <div className="bg-gray-50 rounded-xl p-6 border border-gray-100 relative animate-in fade-in zoom-in duration-200">
      <button
        type="button"
        onClick={onCancel}
        className="absolute top-4 right-4 p-1 text-gray-400 hover:text-gray-600 transition-colors"
      >
        <X className="h-5 w-5" />
      </button>

      <h4 className="text-lg font-bold text-gray-900 mb-6">
        {initialData ? t("editUnit") : t("addUnit")}
      </h4>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Controller
            name="packageTypeId"
            control={control}
            render={({ field }) => (
              <Select
                {...field}
                label={t("packageType") + "*"}
                options={getUniqueOptions(packageTypes)}
                error={errors.packageTypeId?.message}
                disabled={upsertMutation.isPending}
              />
            )}
          />

          <Input
            {...register("conversionFactor")}
            label={t("conversionFactor") + "*"}
            type="number"
            {...positiveNumberInputProps}
            error={errors.conversionFactor?.message}
            disabled={upsertMutation.isPending}
            placeholder="e.g. 10"
          />

          <Input
            {...register("price")}
            label={t("price") + "*"}
            type="number"
            step="0.01"
            {...positiveNumberInputProps}
            error={errors.price?.message}
            disabled={upsertMutation.isPending}
            placeholder="0.00"
          />

          <Input
            {...register("barcode")}
            label={t("barcode")}
            error={errors.barcode?.message}
            disabled={upsertMutation.isPending}
            placeholder="Barcode for this specific unit"
          />
        </div>

        <div className="flex justify-end gap-3 pt-4">
          <Button
            variant="secondary"
            type="button"
            onClick={onCancel}
            disabled={upsertMutation.isPending}
          >
            {t("cancel")}
          </Button>
          <Button type="submit" isLoading={upsertMutation.isPending}>
            {initialData ? t("update") : t("add")}
          </Button>
        </div>
      </form>
    </div>
  );
}
