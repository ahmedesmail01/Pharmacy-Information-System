import Button from "../ui/Button";
import { Plus } from "lucide-react";

interface PageHeaderProps {
  title: string;
  onAddClick?: () => void;
  addLabel?: string;
  children?: React.ReactNode;
}

export default function PageHeader({
  title,
  onAddClick,
  addLabel = "Add New",
  children,
}: PageHeaderProps) {
  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
      </div>
      <div className="flex items-center gap-3">
        {children}
        {onAddClick && (
          <Button onClick={onAddClick} className="gap-2">
            <Plus className="h-4 w-4" />
            {addLabel}
          </Button>
        )}
      </div>
    </div>
  );
}
