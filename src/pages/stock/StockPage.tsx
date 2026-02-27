import Input from "@/components/ui/Input";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import * as z from "zod";

export default function StockPage() {
  const { t, i18n } = useTranslation("stock");
  const stockInSchema = z.object({
    supplier: z.string().min(1, t("supplier_required")),
  });

  type StockInFormValues = z.infer<typeof stockInSchema>;

  // const {
  //     register,
  //     handleSubmit,
  //     reset,
  //     formState: { errors },
  //   } = useForm<StockInFormValues>({
  //     resolver: zodResolver(stockInSchema),
  //     defaultValues: {
  //       quantity: 1,
  //       unitCost: 0,
  //     },
  //   });

  return (
    <div className="space-y-6">
      <p className="font-bold text-xl">{t("title")}</p>
      <form action=""></form>
    </div>
  );
}
