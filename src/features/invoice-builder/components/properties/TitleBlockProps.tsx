import type { TitleBlock, TextStyle } from '../../types/template.types'

interface Props {
  block: TitleBlock
  onChange: (updates: Partial<TitleBlock>) => void
}

export function TitleBlockProps({ block, onChange }: Props) {
  const style = block.style || {}

  const updateStyle = (s: Partial<TextStyle>) => {
    onChange({ style: { ...style, ...s } })
  }

  return (
    <div className="flex flex-col gap-4">
      <div>
        <label className="block text-xs font-medium text-gray-500 mb-1">Font Size</label>
        <select 
          className="w-full text-sm border border-gray-300 rounded p-2 outline-none focus:border-blue-500"
          value={style.fontSize || '3xl'}
          onChange={(e) => updateStyle({ fontSize: e.target.value as any })}
        >
          <option value="xl">XL</option>
          <option value="2xl">2XL</option>
          <option value="3xl">3XL</option>
        </select>
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-500 mb-1">Font Weight</label>
        <select 
          className="w-full text-sm border border-gray-300 rounded p-2 outline-none focus:border-blue-500"
          value={style.fontWeight || 'bold'}
          onChange={(e) => updateStyle({ fontWeight: e.target.value as any })}
        >
          <option value="normal">Normal</option>
          <option value="medium">Medium</option>
          <option value="semibold">Semi-bold</option>
          <option value="bold">Bold</option>
        </select>
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-500 mb-1">Color</label>
        <div className="flex items-center gap-2">
          <input 
            type="color" 
            value={style.color || '#000000'}
            onChange={(e) => updateStyle({ color: e.target.value })}
            className="w-8 h-8 rounded border border-gray-300 cursor-pointer"
          />
        </div>
      </div>
    </div>
  )
}
