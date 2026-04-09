import type { DividerBlock } from '../../types/template.types'

interface Props {
  block: DividerBlock
  onChange: (updates: Partial<DividerBlock>) => void
}

export function DividerBlockProps({ block, onChange }: Props) {
  return (
    <div className="flex flex-col gap-4">
      <div>
        <label className="block text-xs font-medium text-gray-500 mb-1">Style</label>
        <select 
          className="w-full text-sm border border-gray-300 rounded p-2 outline-none"
          value={block.style || 'solid'}
          onChange={(e) => onChange({ style: e.target.value as any })}
        >
          <option value="solid">Solid</option>
          <option value="dashed">Dashed</option>
          <option value="dotted">Dotted</option>
        </select>
      </div>

      <div>
        <label className="block text-xs font-medium text-gray-500 mb-1">Color</label>
        <div className="flex items-center gap-2">
          <input 
            type="color" 
            value={block.color || '#e2e8f0'}
            onChange={(e) => onChange({ color: e.target.value })}
            className="w-8 h-8 rounded border border-gray-300 cursor-pointer"
          />
        </div>
      </div>
    </div>
  )
}
