import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Info, Package, ShieldCheck, Database, Layers } from "lucide-react";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import { useTranslation } from "react-i18next";
import { ProductDto, CreateProductDto, AppLookupDetailDto } from "@/types";
import { lookupService } from "@/api/lookupService";
import { positiveNumberInputProps } from "@/utils/positiveNumberInputProps";

interface ProductFormProps {
  initialData?: ProductDto | null;
  onSubmit: (data: any) => void;
  isLoading?: boolean;
}

export default function ProductForm({
  initialData,
  onSubmit,
  isLoading = false,
}: ProductFormProps) {
  const { t } = useTranslation("products");
  const tc = useTranslation("common").t;

  const productSchema = z.object({
    drugName: z.string().min(1, t("drugNameRequired")).max(200),
    gtin: z.string().optional(),
    barcode: z.string().optional(),
    drugNameAr: z.string().optional(),
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
    vatTypeId: z.string().optional(),
    packageTypeId: z.string().optional(),
    dosageFormId: z.string().optional(),
    productGroupId: z.string().optional(),
    status: z.coerce.number().default(1),
  });

  type ProductFormValues = z.infer<typeof productSchema>;

  const [activeTab, setActiveTab] = useState<
    "basic" | "strength" | "regulatory" | "stock"
  >("basic");
  const [productTypes, setProductTypes] = useState<AppLookupDetailDto[]>([]);
  const [vatTypes, setVatTypes] = useState<AppLookupDetailDto[]>([]);
  const [packageTypeLookups, setPackageTypeLookups] = useState<
    AppLookupDetailDto[]
  >([]);
  const [dosageForms, setDosageForms] = useState<AppLookupDetailDto[]>([]);
  const [productGroups, setProductGroups] = useState<AppLookupDetailDto[]>([]);

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
        const [ptRes, vatRes, pkgRes, doseRes, grpRes] = await Promise.all([
          lookupService.getByCode("PRODUCT_TYPE"),
          lookupService.getByCode("VAT_TYPE").catch(() => null),
          lookupService.getByCode("PACKAGE_TYPE").catch(() => null),
          lookupService.getByCode("DOSAGE_FORM").catch(() => null),
          lookupService.getByCode("PRODUCT_GROUP").catch(() => null),
        ]);
        setProductTypes(ptRes.data.data?.lookupDetails || []);
        if (vatRes) setVatTypes(vatRes.data.data?.lookupDetails || []);
        if (pkgRes)
          setPackageTypeLookups(pkgRes.data.data?.lookupDetails || []);
        if (doseRes) setDosageForms(doseRes.data.data?.lookupDetails || []);
        if (grpRes) setProductGroups(grpRes.data.data?.lookupDetails || []);
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
      barcode: n(initialData.barcode),
      drugNameAr: n(initialData.drugNameAr),
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

      vatTypeId: initialData.vatTypeId
        ? String(initialData.vatTypeId)
        : undefined,
      packageTypeId: initialData.packageTypeId
        ? String(initialData.packageTypeId)
        : undefined,
      dosageFormId: initialData.dosageFormId
        ? String(initialData.dosageFormId)
        : undefined,
      productGroupId: initialData.productGroupId
        ? String(initialData.productGroupId)
        : undefined,

      status: initialData.status ?? 1,
    });
  }, [initialData, reset]);

  const tabs = [
    { id: "basic", label: t("basicInfo"), icon: Info },
    { id: "strength", label: t("strengthPackaging"), icon: Layers },
    { id: "regulatory", label: t("regulatory"), icon: ShieldCheck },
    { id: "stock", label: t("stockLevels"), icon: Database },
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
              label={t("drugName") + "*"}
              placeholder="e.g. Panadol Extra"
              error={errors.drugName?.message}
              disabled={isLoading}
            />
            <Input
              {...register("gtin")}
              label={t("gtin")}
              placeholder="Global Trade Item Number"
              disabled={isLoading}
            />
            <Input
              {...register("barcode")}
              label={t("barcode")}
              placeholder="Standard barcode"
              disabled={isLoading}
            />
            <Input
              {...register("genericName")}
              label={t("genericName")}
              placeholder="e.g. Paracetamol"
              disabled={isLoading}
            />
            <Input
              {...register("drugNameAr")}
              label={t("drugNameAr")}
              placeholder="اسم الدواء بالعربية"
              disabled={isLoading}
            />
            <Select
              {...register("productTypeId")}
              label={t("productType")}
              options={productTypes.map((pt) => ({
                value: String(pt.oid),
                label: pt.valueNameEn || pt.valueNameAr || "",
              }))}
              disabled={isLoading}
            />
            <Input
              {...register("price")}
              label={t("price")}
              type="number"
              {...positiveNumberInputProps}
              step="0.01"
              disabled={isLoading}
            />
            <Select
              {...register("status")}
              label={tc("status")}
              options={[
                { value: "1", label: tc("active") },
                { value: "0", label: tc("inactive") },
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
                label={t("strengthValue")}
                placeholder="500"
                {...positiveNumberInputProps}
                disabled={isLoading}
              />
              <Input
                {...register("strengthUnit")}
                label={t("strengthUnit")}
                placeholder="mg"
                {...positiveNumberInputProps}
                disabled={isLoading}
              />
            </div>
            <Input
              {...register("packageType")}
              label={t("packageType")}
              placeholder="e.g. Box"
              disabled={isLoading}
            />
            <Input
              {...register("packageSize")}
              label={t("packageSize")}
              placeholder="e.g. 24 Tablets"
              disabled={isLoading}
              {...positiveNumberInputProps}
            />
            <div className="grid grid-cols-2 gap-4">
              <Input
                {...register("volume")}
                label={t("volume")}
                type="number"
                {...positiveNumberInputProps}
                disabled={isLoading}
              />
              <Input
                {...register("unitOfVolume")}
                label={t("unitOfVolume")}
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
              label={t("registrationNumber")}
              disabled={isLoading}
              {...positiveNumberInputProps}
            />
            <Input
              {...register("manufacturer")}
              label={t("manufacturer")}
              disabled={isLoading}
            />
            <Input
              {...register("countryOfOrigin")}
              label={t("countryOfOrigin")}
              disabled={isLoading}
            />
            <Select
              {...register("vatTypeId")}
              label={t("vatType")}
              options={vatTypes.map((v) => ({
                value: String(v.oid),
                label: v.valueNameEn || v.valueNameAr || "",
              }))}
              disabled={isLoading}
            />
            <Select
              {...register("packageTypeId")}
              label="Package Type (Lookup)"
              options={packageTypeLookups.map((p) => ({
                value: String(p.oid),
                label: p.valueNameEn || p.valueNameAr || "",
              }))}
              disabled={isLoading}
            />
            <Select
              {...register("dosageFormId")}
              label={t("dosageForm")}
              options={dosageForms.map((d) => ({
                value: String(d.oid),
                label: d.valueNameEn || d.valueNameAr || "",
              }))}
              disabled={isLoading}
            />
            <Select
              {...register("productGroupId")}
              label={t("productGroup")}
              options={productGroups.map((g) => ({
                value: String(g.oid),
                label: g.valueNameEn || g.valueNameAr || "",
              }))}
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
                  {t("exportable")}
                </span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer group">
                <input
                  type="checkbox"
                  {...register("isImportable")}
                  className="h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm font-medium text-gray-700 group-hover:text-gray-900 transition-colors">
                  {t("importable")}
                </span>
              </label>
            </div>
          </div>
        )}

        {activeTab === "stock" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in slide-in-from-left-4 duration-300">
            <Input
              {...register("minStockLevel")}
              label={t("minStockLevel")}
              type="number"
              disabled={isLoading}
              {...positiveNumberInputProps}
            />
            <Input
              {...register("maxStockLevel")}
              label={t("maxStockLevel")}
              type="number"
              disabled={isLoading}
              {...positiveNumberInputProps}
            />
            <div className="p-4 bg-blue-50 rounded-xl border border-blue-100 col-span-1 md:col-span-2">
              <div className="flex gap-3 text-blue-700">
                <Info className="h-5 w-5 flex-shrink-0 mt-0.5" />
                <div className="text-sm">
                  <p className="font-bold mb-1">{t("stockLevels")}</p>
                  <p>{t("stockLevels")} info...</p>
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
            {initialData ? t("updateProduct") : t("createProduct")}
          </Button>
        </div>
      </form>
    </div>
  );
}
