import { useState, useEffect } from "react";
import { Search } from "lucide-react";
import { useTranslation } from "react-i18next";
import Input from "../ui/Input";

interface SearchBarProps {
  onSearch: (value: string) => void;
  placeholder?: string;
  delay?: number;
}

export default function SearchBar({
  onSearch,
  placeholder,
  delay = 300,
}: SearchBarProps) {
  const [value, setValue] = useState("");
  const { t } = useTranslation();

  useEffect(() => {
    const handler = setTimeout(() => {
      onSearch(value);
    }, delay);

    return () => clearTimeout(handler);
  }, [value, onSearch, delay]);

  return (
    <div className="relative w-full max-w-sm">
      <div className="absolute inset-y-0 start-0 ps-3 flex items-center pointer-events-none text-gray-400">
        <Search className="h-4 w-4" />
      </div>
      <Input
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={placeholder || t("common:search")}
        className="ps-10"
      />
    </div>
  );
}
