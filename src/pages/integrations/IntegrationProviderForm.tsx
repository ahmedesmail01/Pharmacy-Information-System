import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useEffect } from "react";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import { IntegrationProviderDto } from "@/types";

const providerSchema = z.object({
  name: z.string().optional(),
  description: z.string().optional(),
  status: z.coerce.number().default(1),
});

type ProviderFormValues = z.infer<typeof providerSchema>;

interface IntegrationProviderFormProps {
  initialData?: IntegrationProviderDto | null;
  onSubmit: (data: ProviderFormValues) => void;
  isLoading?: boolean;
}

export default function IntegrationProviderForm({
  initialData,
  onSubmit,
  isLoading = false,
}: IntegrationProviderFormProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ProviderFormValues>({
    resolver: zodResolver(providerSchema),
    defaultValues: {
      status: 1,
    },
  });

  useEffect(() => {
    if (initialData) {
      reset({
        name: initialData.name || "",
        description: initialData.description || "",
        status: initialData.status ?? 1,
      });
    } else {
      reset({
        name: "",
        description: "",
        status: 1,
      });
    }
  }, [initialData, reset]);

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <Input
        {...register("name")}
        label="Provider Name"
        placeholder="e.g. ZATCA, NHC, Seha"
        error={errors.name?.message}
        disabled={isLoading}
      />

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Description
        </label>
        <textarea
          {...register("description")}
          placeholder="Brief description of this integration provider"
          disabled={isLoading}
          rows={3}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white disabled:opacity-50 disabled:cursor-not-allowed resize-none"
        />
      </div>

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
          {initialData ? "Update Provider" : "Create Provider"}
        </Button>
      </div>
    </form>
  );
}
