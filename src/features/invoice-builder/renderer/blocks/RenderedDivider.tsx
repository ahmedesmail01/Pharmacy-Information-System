import type { DividerBlock } from '../../types/template.types'

export function RenderedDivider({ block }: { block: DividerBlock }) {
  return (
    <div className="py-4 w-full">
      <hr 
        style={{ 
          borderTopStyle: block.style || 'solid', 
          borderColor: block.color || '#e2e8f0',
          borderTopWidth: '1px',
          width: '100%'
        }} 
      />
    </div>
  )
}
