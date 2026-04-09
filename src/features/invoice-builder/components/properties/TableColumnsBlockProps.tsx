import { nanoid } from 'nanoid'
import type { TableColumnsBlock, TableColumnDef } from '../../types/template.types'

interface Props {
  block: TableColumnsBlock
  onChange: (updates: Partial<TableColumnsBlock>) => void
}

export function TableColumnsBlockProps({ block, onChange }: Props) {
  const updateColumn = (colId: string, updates: Partial<TableColumnDef>) => {
    onChange({
      columns: block.columns.map(c => c.id === colId ? { ...c, ...updates } : c)
    })
  }

  const addColumn = () => {
    onChange({
      columns: [...block.columns, { 
        id: nanoid(), key: 'newField', label: 'New Column', width: 1, align: 'left', format: 'text' 
      }]
    })
  }

  const removeColumn = (colId: string) => {
    if (block.columns.length <= 1) return
    onChange({
      columns: block.columns.filter(c => c.id !== colId)
    })
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <label className="text-sm text-gray-700">Show Header</label>
        <input 
          type="checkbox" 
          checked={block.showHeader ?? true} 
          onChange={(e) => onChange({ showHeader: e.target.checked })}
        />
      </div>
      <div className="flex items-center justify-between">
        <label className="text-sm text-gray-700">Stripe Rows</label>
        <input 
          type="checkbox" 
          checked={block.stripeRows ?? true} 
          onChange={(e) => onChange({ stripeRows: e.target.checked })}
        />
      </div>
      
      <div className="border-t border-gray-200 my-2 pt-4">
        <div className="flex items-center justify-between mb-2">
          <label className="text-sm text-gray-700">Show Total Row</label>
          <input 
            type="checkbox" 
            checked={block.showTotal ?? true} 
            onChange={(e) => onChange({ showTotal: e.target.checked })}
          />
        </div>
        {block.showTotal && (
          <div className="flex flex-col gap-2 pl-4 border-l-2 border-gray-100 mb-4">
            <input 
              type="text" 
              className="text-sm border border-gray-300 rounded p-1 outline-none"
              value={block.totalLabel || 'Total'}
              onChange={(e) => onChange({ totalLabel: e.target.value })}
              placeholder="Total Label"
            />
            <select 
              className="text-sm border border-gray-300 rounded p-1 outline-none"
              value={block.totalField || ''}
              onChange={(e) => onChange({ totalField: e.target.value })}
            >
              <option value="" disabled>Select column to sum...</option>
              {block.columns.filter(c => c.format === 'currency' || c.format === 'number').map(col => (
                <option key={col.id} value={col.key}>{col.label} ({col.key})</option>
              ))}
            </select>
            <p className="text-xs text-gray-400">Only numeric/currency columns can be summed.</p>
          </div>
        )}
      </div>

      <div>
        <label className="block text-xs font-medium text-gray-500 mb-2">Columns</label>
        <div className="space-y-2">
          {block.columns.map((col, i) => (
            <div key={col.id} className="flex flex-col gap-2 bg-gray-50 p-2 border border-gray-200 rounded">
              <div className="flex justify-between items-center gap-2">
                <input 
                  type="text" 
                  className="w-full text-sm font-semibold border-b border-transparent hover:border-gray-300 outline-none bg-transparent"
                  value={col.label}
                  onChange={(e) => updateColumn(col.id, { label: e.target.value })}
                  placeholder="Column Label"
                />
                <button 
                  onClick={() => removeColumn(col.id)} 
                  disabled={block.columns.length <= 1}
                  className="text-red-500 hover:text-red-700 disabled:opacity-30  p-1"
                >✕</button>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <span className="text-xs text-gray-400">Data Key</span>
                  <input 
                    type="text" 
                    className="w-full text-xs border border-gray-300 rounded p-1"
                    value={col.key}
                    onChange={(e) => updateColumn(col.id, { key: e.target.value })}
                    placeholder="e.g. description"
                  />
                </div>
                <div>
                  <span className="text-xs text-gray-400">Format</span>
                  <select 
                    className="w-full text-xs border border-gray-300 rounded p-1"
                    value={col.format || 'text'}
                    onChange={(e) => updateColumn(col.id, { format: e.target.value as any })}
                  >
                    <option value="text">Text</option>
                    <option value="currency">Currency</option>
                    <option value="number">Number</option>
                    <option value="date">Date</option>
                  </select>
                </div>
                <div>
                  <span className="text-xs text-gray-400">Align</span>
                  <select 
                    className="w-full text-xs border border-gray-300 rounded p-1"
                    value={col.align || 'left'}
                    onChange={(e) => updateColumn(col.id, { align: e.target.value as any })}
                  >
                    <option value="left">Left</option>
                    <option value="center">Center</option>
                    <option value="right">Right</option>
                  </select>
                </div>
                <div>
                  <span className="text-xs text-gray-400">Width Ratio</span>
                  <input 
                    type="number" 
                    className="w-full text-xs border border-gray-300 rounded p-1"
                    value={col.width ?? 1}
                    onChange={(e) => updateColumn(col.id, { width: Number(e.target.value) })}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
        <button 
          onClick={addColumn}
          className="w-full mt-2 py-1 border border-dashed border-gray-300 rounded text-sm text-gray-600 hover:bg-gray-50 hover:border-gray-400"
        >
          + Add Column
        </button>
      </div>
    </div>
  )
}
