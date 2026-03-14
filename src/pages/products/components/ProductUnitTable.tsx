import { Edit2, Trash2, Package } from "lucide-react";
import { useTranslation } from "react-i18next";
import { ProductUnitDto } from "@/types";
import { useDeleteProductUnit } from "@/hooks/queries/useProducts";
import Button from "@/components/ui/Button";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import { useState } from "react";
import { formatCurrency } from "@/utils/formatUtils";

interface ProductUnitTableProps {
  productId: string;
  units: ProductUnitDto[];
  onEdit: (unit: ProductUnitDto) => void;
  isLoading?: boolean;
}

export default function ProductUnitTable({
  productId,
  units,
  onEdit,
  isLoading = false,
}: ProductUnitTableProps) {
  const { t } = useTranslation("products");
  const tc = useTranslation("common").t;
  const deleteMutation = useDeleteProductUnit(productId);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleDelete = () => {
    if (deletingId) {
      deleteMutation.mutate(deletingId, {
        onSuccess: () => setDeletingId(null),
      });
    }
  };

  if (units.length === 0 && !isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-12 px-4 border-2 border-dashed border-gray-100 rounded-xl bg-gray-50/50">
        <div className="p-3 bg-white rounded-full shadow-sm mb-4">
          <Package className="h-6 w-6 text-gray-400" />
        </div>
        <p className="text-gray-500 font-medium">{t("noUnitsFound")}</p>
        <p className="text-gray-400 text-sm mt-1">{t("addYourFirstUnit")}</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-gray-200 shadow-sm">
      <table className="w-full text-left border-collapse bg-white">
        <thead>
          <tr className="bg-gray-50 border-b border-gray-200">
            <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">
              {t("packageType")}
            </th>
            <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-center">
              {t("conversionFactor")}
            </th>
            <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-center">
              {t("price")}
            </th>
            <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">
              {t("barcode")}
            </th>
            <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">
              {tc("actions")}
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {units.map((unit) => (
            <tr
              key={unit.oid}
              className="hover:bg-blue-50/30 transition-colors group"
            >
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gray-50 rounded-lg group-hover:bg-white transition-colors">
                    <Package className="h-4 w-4 text-blue-600" />
                  </div>
                  <span className="font-semibold text-gray-900">
                    {unit.packageTypeName}
                  </span>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-center text-gray-600 font-medium">
                {unit.conversionFactor}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-center text-blue-600 font-bold">
                {formatCurrency(unit.price)}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-gray-500 font-mono text-sm">
                {unit.barcode || "-"}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-right space-x-2 rtl:space-x-reverse">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onEdit(unit)}
                  title={tc("edit")}
                  className="p-2"
                >
                  <Edit2 className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setDeletingId(unit.oid)}
                  title={tc("delete")}
                  className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <ConfirmDialog
        isOpen={!!deletingId}
        onClose={() => setDeletingId(null)}
        onConfirm={handleDelete}
        title={t("deleteUnit")}
        message={t("deleteUnitConfirm")}
        variant="danger"
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
}
