import { ShieldX } from "lucide-react";
import { useTranslation } from "react-i18next";

interface AccessDeniedProps {
  title?: string;
  message?: string;
}

export default function AccessDenied({ title, message }: AccessDeniedProps) {
  const { t } = useTranslation("common");

  return (
    <div className="flex flex-col items-center justify-center py-20 px-6 text-center">
      <div className="w-20 h-20 rounded-2xl bg-red-50 flex items-center justify-center mb-6">
        <ShieldX className="h-10 w-10 text-red-400" />
      </div>
      <h2 className="text-xl font-bold text-gray-800 mb-2">
        {title || t("access_denied", { defaultValue: "Access Denied" })}
      </h2>
      <p className="text-sm text-gray-500 max-w-md">
        {message ||
          t("access_denied_message", {
            defaultValue:
              "You don't have permission to access this page. Please contact your administrator if you believe this is an error.",
          })}
      </p>
    </div>
  );
}
