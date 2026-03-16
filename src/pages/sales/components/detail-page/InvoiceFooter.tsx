import { useTranslation } from "react-i18next";

export default function InvoiceFooter() {
  const { t } = useTranslation("sales");

  return (
    <div className="flex flex-col items-center justify-center pt-8 border-t border-gray-100 space-y-2">
      <p className="text-gray-500 italic font-serif text-lg">
        "{t("thank_you")}"
      </p>
      <p className="text-xs text-gray-400 tracking-wider uppercase">
        {t("generated_by_pos")}
      </p>
    </div>
  );
}
