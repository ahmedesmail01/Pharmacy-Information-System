import { nanoid } from "nanoid";
import type { ColumnsBlock, ColumnDef } from "../../types/template.types";

interface Props {
  block: ColumnsBlock;
  onChange: (updates: Partial<ColumnsBlock>) => void;
}

export function ColumnsBlockProps({ block, onChange }: Props) {
  const updateColumn = (colId: string, updates: Partial<ColumnDef>) => {
    onChange({
      columns: block.columns.map((c) =>
        c.id === colId ? { ...c, ...updates } : c,
      ),
    });
  };

  const addColumn = () => {
    onChange({
      columns: [
        ...block.columns,
        {
          id: nanoid(),
          label: `Col ${block.columns.length + 1}`,
          width: 1,
          blocks: [],
        },
      ],
    });
  };

  const removeColumn = (colId: string) => {
    if (block.columns.length <= 1) return;
    onChange({
      columns: block.columns.filter((c) => c.id !== colId),
    });
  };

  return (
    <div className="flex flex-col gap-4">
      <div>
        <label className="block text-xs font-medium text-gray-500 mb-1">
          Gap (px)
        </label>
        <input
          type="number"
          className="w-full text-sm border border-gray-300 rounded p-2 outline-none"
          value={block.gap ?? 24}
          onChange={(e) => onChange({ gap: Number(e.target.value) })}
        />
      </div>

      <div className="mt-2">
        <label className="block text-xs font-medium text-gray-500 mb-2">
          Columns
        </label>
        {block.columns.map((col, i) => (
          <div
            key={col.id}
            className="flex gap-2 mb-2 items-center bg-gray-50 p-2 border border-gray-200 rounded"
          >
            <div className="flex flex-col flex-1 gap-1">
              <input
                type="text"
                className="text-sm border border-gray-300 rounded p-1 outline-none"
                value={col.label}
                onChange={(e) =>
                  updateColumn(col.id, { label: e.target.value })
                }
                placeholder="Label"
              />
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-400">Width ratio:</span>
                <input
                  type="number"
                  min="1"
                  className="w-16 text-sm border border-gray-300 rounded p-1 outline-none"
                  value={col.width}
                  onChange={(e) =>
                    updateColumn(col.id, { width: Number(e.target.value) })
                  }
                />
              </div>
            </div>
            <button
              onClick={() => removeColumn(col.id)}
              disabled={block.columns.length <= 1}
              className="text-red-500 hover:text-red-700 disabled:opacity-30 disabled:cursor-not-allowed p-1"
            >
              ✕
            </button>
          </div>
        ))}
        <button
          onClick={addColumn}
          className="w-full mt-2 py-1 border border-dashed border-gray-300 rounded text-sm text-gray-600 hover:bg-gray-50 hover:border-gray-400"
        >
          + Add Column
        </button>
      </div>
    </div>
  );
}
