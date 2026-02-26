import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Info, Package, ShieldCheck, Database, Layers } from "lucide-react";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import { ProductDto, CreateProductDto, AppLookupDetailDto } from "@/types";
import { lookupService } from "@/api/lookupService";
import { positiveNumberInputProps } from "@/utils/positiveNumberInputProps";

const productSchema = z.object({
  drugName: z.string().min(1, "Drug name is required").max(200),
  gtin: z.string().optional(),
  genericName: z.string().optional(),
  productTypeId: z.string().optional(),
  strengthValue: z.string().optional(),
  strengthUnit: z.string().optional(),
  packageType: z.string().optional(),
  packageSize: z.string().optional(),
  price: z.coerce.number().min(0).optional(),
  registrationNumber: z.string().optional(),
  volume: z.coerce.number().optional(),
  unitOfVolume: z.string().optional(),
  manufacturer: z.string().optional(),
  countryOfOrigin: z.string().optional(),
  minStockLevel: z.coerce.number().optional(),
  maxStockLevel: z.coerce.number().optional(),
  isExportable: z.boolean().default(false),
  isImportable: z.boolean().default(false),
  drugStatus: z.string().optional(),
  marketingStatus: z.string().optional(),
  legalStatus: z.string().optional(),
  status: z.coerce.number().default(1),
});

type ProductFormValues = z.infer<typeof productSchema>;

interface ProductFormProps {
  initialData?: ProductDto | null;
  onSubmit: (data: ProductFormValues) => void;
  isLoading?: boolean;
}

export default function ProductForm({
  initialData,
  onSubmit,
  isLoading = false,
}: ProductFormProps) {
  const [activeTab, setActiveTab] = useState<
    "basic" | "strength" | "regulatory" | "stock"
  >("basic");
  const [productTypes, setProductTypes] = useState<AppLookupDetailDto[]>([]);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      status: 1,
      isExportable: false,
      isImportable: false,
    },
  });

  console.log("Form errors:", errors);

  useEffect(() => {
    const fetchLookups = async () => {
      try {
        const res = await lookupService.getByCode("PRODUCT_TYPE");
        setProductTypes(res.data.data?.lookupDetails || []);
      } catch (err) {
        console.error("Failed to fetch product types", err);
      }
    };
    fetchLookups();
  }, []);

  const n = <T,>(v: T | null | undefined) => (v === null ? undefined : v);

  useEffect(() => {
    if (!initialData) return;

    reset({
      drugName: initialData.drugName ?? "",
      gtin: n(initialData.gtin),
      genericName: n(initialData.genericName),
      productTypeId: initialData.productTypeId
        ? String(initialData.productTypeId)
        : undefined,

      strengthValue: n(initialData.strengthValue),
      strengthUnit: n(initialData.strengthUnit),
      packageType: n(initialData.packageType),
      packageSize: n(initialData.packageSize),

      price: initialData.price ?? 0,

      registrationNumber: n(initialData.registrationNumber),
      volume: initialData.volume ?? 0,
      unitOfVolume: n(initialData.unitOfVolume),

      manufacturer: n(initialData.manufacturer),
      countryOfOrigin: n(initialData.countryOfOrigin),

      minStockLevel: initialData.minStockLevel ?? 0,
      maxStockLevel: initialData.maxStockLevel ?? 0,

      isExportable: !!initialData.isExportable,
      isImportable: !!initialData.isImportable,

      drugStatus: n(initialData.drugStatus),
      marketingStatus: n(initialData.marketingStatus),
      legalStatus: n(initialData.legalStatus),

      status: initialData.status ?? 1,
    });
  }, [initialData, reset]);

  const tabs = [
    { id: "basic", label: "Basic Info", icon: Info },
    { id: "strength", label: "Strength & Packaging", icon: Layers },
    { id: "regulatory", label: "Regulatory", icon: ShieldCheck },
    { id: "stock", label: "Stock Levels", icon: Database },
  ];

  const onInvalid = (errs: any) => {
    console.log("INVALID SUBMIT:", errs);
  };

  return (
    <div className="space-y-6">
      <div className="flex border-b border-gray-100 overflow-x-auto no-scrollbar">
        {tabs.map((tab) => (
          <button
            type="button"
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center gap-2 px-6 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
              activeTab === tab.id
                ? "border-blue-600 text-blue-600 bg-blue-50/50"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50"
            }`}
          >
            <tab.icon className="h-4 w-4" />
            {tab.label}
          </button>
        ))}
      </div>

      <form onSubmit={handleSubmit(onSubmit, onInvalid)} className="space-y-6">
        {activeTab === "basic" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in slide-in-from-left-4 duration-300">
            <Input
              {...register("drugName")}
              label="Drug Name*"
              placeholder="e.g. Panadol Extra"
              error={errors.drugName?.message}
              disabled={isLoading}
            />
            <Input
              {...register("gtin")}
              label="GTIN"
              placeholder="Global Trade Item Number"
              disabled={isLoading}
            />
            <Input
              {...register("genericName")}
              label="Generic Name"
              placeholder="e.g. Paracetamol"
              disabled={isLoading}
            />
            <Select
              {...register("productTypeId")}
              label="Product Type"
              options={productTypes.map((pt) => ({
                value: String(pt.oid),
                label: pt.valueNameEn || pt.valueNameAr || "",
              }))}
              disabled={isLoading}
            />
            <Input
              {...register("price")}
              label="Retail Price"
              type="number"
              {...positiveNumberInputProps}
              step="0.01"
              disabled={isLoading}
            />
            <Select
              {...register("status")}
              label="Status"
              options={[
                { value: "1", label: "Active" },
                { value: "0", label: "Inactive" },
              ]}
              disabled={isLoading}
            />
          </div>
        )}

        {activeTab === "strength" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in slide-in-from-left-4 duration-300">
            <div className="grid grid-cols-2 gap-4">
              <Input
                {...register("strengthValue")}
                label="Strength Value"
                placeholder="500"
                {...positiveNumberInputProps}
                disabled={isLoading}
              />
              <Input
                {...register("strengthUnit")}
                label="Strength Unit"
                placeholder="mg"
                {...positiveNumberInputProps}
                disabled={isLoading}
              />
            </div>
            <Input
              {...register("packageType")}
              label="Package Type"
              placeholder="e.g. Box"
              disabled={isLoading}
            />
            <Input
              {...register("packageSize")}
              label="Package Size"
              placeholder="e.g. 24 Tablets"
              disabled={isLoading}
              {...positiveNumberInputProps}
            />
            <div className="grid grid-cols-2 gap-4">
              <Input
                {...register("volume")}
                label="Volume"
                type="number"
                {...positiveNumberInputProps}
                disabled={isLoading}
              />
              <Input
                {...register("unitOfVolume")}
                label="Unit of Volume"
                placeholder="ml"
                {...positiveNumberInputProps}
                disabled={isLoading}
              />
            </div>
          </div>
        )}

        {activeTab === "regulatory" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in slide-in-from-left-4 duration-300">
            <Input
              {...register("registrationNumber")}
              label="Registration Number"
              disabled={isLoading}
              {...positiveNumberInputProps}
            />
            <Input
              {...register("manufacturer")}
              label="Manufacturer"
              disabled={isLoading}
            />
            <Input
              {...register("countryOfOrigin")}
              label="Country of Origin"
              disabled={isLoading}
            />
            <div className="flex flex-col gap-4 mt-6">
              <label className="flex items-center gap-3 cursor-pointer group">
                <input
                  type="checkbox"
                  {...register("isExportable")}
                  className="h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm font-medium text-gray-700 group-hover:text-gray-900 transition-colors">
                  Exportable Product
                </span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer group">
                <input
                  type="checkbox"
                  {...register("isImportable")}
                  className="h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm font-medium text-gray-700 group-hover:text-gray-900 transition-colors">
                  Importable Product
                </span>
              </label>
            </div>
          </div>
        )}

        {activeTab === "stock" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in slide-in-from-left-4 duration-300">
            <Input
              {...register("minStockLevel")}
              label="Minimum Stock Level"
              type="number"
              disabled={isLoading}
              {...positiveNumberInputProps}
            />
            <Input
              {...register("maxStockLevel")}
              label="Maximum Stock Level"
              type="number"
              disabled={isLoading}
              {...positiveNumberInputProps}
            />
            <div className="p-4 bg-blue-50 rounded-xl border border-blue-100 col-span-1 md:col-span-2">
              <div className="flex gap-3 text-blue-700">
                <Info className="h-5 w-5 flex-shrink-0 mt-0.5" />
                <div className="text-sm">
                  <p className="font-bold mb-1">Stock Level Alerts</p>
                  <p>
                    When current stock falls below the minimum level, it will be
                    highlighted in the dashboard and inventory reports.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="flex justify-end pt-4 border-t border-gray-100">
          <Button
            type="submit"
            isLoading={isLoading}
            className="px-10 py-3 shadow-lg shadow-blue-200"
          >
            {initialData ? "Update Product" : "Add Product"}
          </Button>
        </div>
      </form>
    </div>
  );
}
