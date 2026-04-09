import { HeaderMetaBlock } from "../../types/template.types";

interface Props {
  block: HeaderMetaBlock;
  onChange: (updates: Partial<HeaderMetaBlock>) => void;
}

export function HeaderMetaBlockProps({ block, onChange }: Props) {
  return (
    <div className="flex flex-col gap-4">
      <div className="bg-gray-50 p-2 rounded border border-gray-200">
        <div className="flex items-center justify-between mb-2">
          <label className="text-sm font-semibold text-gray-700">
            Show Logo
          </label>
          <input
            type="checkbox"
            checked={block.showLogo ?? true}
            onChange={(e) => onChange({ showLogo: e.target.checked })}
          />
        </div>
        {block.showLogo && (
          <div className="flex flex-col gap-1">
            <span className="text-xs text-gray-400">
              In the builder, the logo image is controlled by runtime data.
            </span>
          </div>
        )}
      </div>

      <div className="bg-gray-50 p-2 rounded border border-gray-200">
        <div className="flex items-center justify-between mb-2">
          <label className="text-sm font-semibold text-gray-700">
            Invoice Number
          </label>
          <input
            type="checkbox"
            checked={block.showInvoiceNumber ?? true}
            onChange={(e) => onChange({ showInvoiceNumber: e.target.checked })}
          />
        </div>
        {block.showInvoiceNumber && (
          <div>
            <span className="text-xs text-gray-400 block mb-1">Label</span>
            <input
              type="text"
              className="w-full text-sm border border-gray-300 rounded p-1 outline-none"
              value={block.invoiceNumberLabel || "Invoice #"}
              onChange={(e) => onChange({ invoiceNumberLabel: e.target.value })}
            />
          </div>
        )}
      </div>

      <div className="bg-gray-50 p-2 rounded border border-gray-200">
        <div className="flex items-center justify-between mb-2">
          <label className="text-sm font-semibold text-gray-700">
            Issue Date
          </label>
          <input
            type="checkbox"
            checked={block.showDate ?? true}
            onChange={(e) => onChange({ showDate: e.target.checked })}
          />
        </div>
        {block.showDate && (
          <div>
            <span className="text-xs text-gray-400 block mb-1">Label</span>
            <input
              type="text"
              className="w-full text-sm border border-gray-300 rounded p-1 outline-none"
              value={block.dateLabel || "Date"}
              onChange={(e) => onChange({ dateLabel: e.target.value })}
            />
          </div>
        )}
      </div>

      <div className="bg-gray-50 p-2 rounded border border-gray-200">
        <div className="flex items-center justify-between mb-2">
          <label className="text-sm font-semibold text-gray-700">
            Due Date
          </label>
          <input
            type="checkbox"
            checked={block.showDueDate ?? true}
            onChange={(e) => onChange({ showDueDate: e.target.checked })}
          />
        </div>
        {block.showDueDate && (
          <div>
            <span className="text-xs text-gray-400 block mb-1">Label</span>
            <input
              type="text"
              className="w-full text-sm border border-gray-300 rounded p-1 outline-none"
              value={block.dueDateLabel || "Due Date"}
              onChange={(e) => onChange({ dueDateLabel: e.target.value })}
            />
          </div>
        )}
      </div>
    </div>
  );
}
