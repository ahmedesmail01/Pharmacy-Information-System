import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useEffect, useState } from "react";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import { BranchDto, AppLookupDetailDto } from "@/types";
import { lookupService } from "@/api/lookupService";

const branchSchema = z.object({
  branchCode: z.string().optional(),
  branchName: z.string().min(1, "Branch name is required").max(100),
  gln: z.string().optional(),
  city: z.string().optional(),
  district: z.string().optional(),
  address: z.string().optional(),
  crn: z.string().max(20).optional(),
  vatNumber: z.string().max(20).optional(),
  identifyLookupId: z.string().optional(),
  identifyValue: z.string().optional(),
  streetName: z.string().max(100).optional(),
  buildingNumber: z.string().max(10).optional(),
  citySubdivisionName: z.string().max(100).optional(),
  cityName: z.string().max(100).optional(),
  postalZone: z.string().max(10).optional(),
  registrationName: z.string().max(200).optional(),
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
  const [identifyTypes, setIdentifyTypes] = useState<AppLookupDetailDto[]>([]);
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
    const fetchLookups = async () => {
      try {
        const res = await lookupService.getByCode("IDENTIFY_TYPE");
        setIdentifyTypes(res.data.data?.lookupDetails || []);
      } catch (err) {
        console.error("Failed to fetch identification types", err);
      }
    };
    fetchLookups();
  }, []);

  useEffect(() => {
    if (initialData) {
      reset({
        branchCode: initialData.branchCode || "",
        branchName: initialData.branchName || "",
        gln: initialData.gln || "",
        city: initialData.city || "",
        district: initialData.district || "",
        address: initialData.address || "",
        crn: initialData.crn || "",
        vatNumber: initialData.vatNumber || "",
        identifyLookupId: initialData.identifyLookupId || "",
        identifyValue: initialData.identifyValue || "",
        streetName: initialData.streetName || "",
        buildingNumber: initialData.buildingNumber || "",
        citySubdivisionName: initialData.citySubdivisionName || "",
        cityName: initialData.cityName || "",
        postalZone: initialData.postalZone || "",
        registrationName: initialData.registrationName || "",
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
        crn: "",
        vatNumber: "",
        identifyLookupId: "",
        identifyValue: "",
        streetName: "",
        buildingNumber: "",
        citySubdivisionName: "",
        cityName: "",
        postalZone: "",
        registrationName: "",
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

      {/* ── Legal & Regulatory ───────────────────────────────────────── */}
      <div className="pt-4 mt-4 border-t border-gray-100">
        <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-4">
          Legal & Regulatory
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            {...register("crn")}
            label="CRN (Commercial Registration No.)"
            placeholder="Max 20 characters"
            error={errors.crn?.message}
            disabled={isLoading}
          />
          <Input
            {...register("vatNumber")}
            label="VAT Number"
            placeholder="Max 20 characters"
            error={errors.vatNumber?.message}
            disabled={isLoading}
          />
          <Select
            {...register("identifyLookupId")}
            label="Identification Type"
            options={identifyTypes.map((t) => ({
              value: t.oid,
              label: t.valueNameEn || t.valueNameAr || "",
            }))}
            disabled={isLoading}
          />
          <Input
            {...register("identifyValue")}
            label="Identification Value"
            placeholder="Enter identification value"
            disabled={isLoading}
          />
          <Input
            {...register("registrationName")}
            label="Registration Name"
            placeholder="Max 200 characters"
            error={errors.registrationName?.message}
            disabled={isLoading}
            className="md:col-span-2"
          />
        </div>
      </div>

      {/* ── Address Details ───────────────────────────────────────────── */}
      <div className="pt-4 mt-4 border-t border-gray-100">
        <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-4">
          Address Details
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            {...register("streetName")}
            label="Street Name"
            placeholder="Max 100 characters"
            error={errors.streetName?.message}
            disabled={isLoading}
          />
          <Input
            {...register("buildingNumber")}
            label="Building Number"
            placeholder="Max 10 characters"
            error={errors.buildingNumber?.message}
            disabled={isLoading}
          />
          <Input
            {...register("citySubdivisionName")}
            label="City Subdivision / District"
            placeholder="Max 100 characters"
            error={errors.citySubdivisionName?.message}
            disabled={isLoading}
          />
          <Input
            {...register("cityName")}
            label="City Name"
            placeholder="Max 100 characters"
            error={errors.cityName?.message}
            disabled={isLoading}
          />
          <Input
            {...register("postalZone")}
            label="Postal / ZIP Code"
            placeholder="Max 10 characters"
            error={errors.postalZone?.message}
            disabled={isLoading}
          />
        </div>
      </div>

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
