import type { SpacerBlock } from '../../types/template.types'

interface Props {
  block: SpacerBlock
  onChange: (updates: Partial<SpacerBlock>) => void
}

export function SpacerBlockProps({ block, onChange }: Props) {
  return (
    <div className="flex flex-col gap-4">
      <div>
        <label className="block text-xs font-medium text-gray-500 mb-1">Height (px)</label>
        <input 
          type="number" 
          className="w-full text-sm border border-gray-300 rounded p-2 outline-none"
          value={block.height}
          onChange={(e) => onChange({ height: Number(e.target.value) })}
        />
      </div>
    </div>
  )
}
