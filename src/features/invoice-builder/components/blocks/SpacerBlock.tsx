import type { SpacerBlock } from '../../types/template.types'
import { RenderedSpacer } from '../../renderer/blocks/RenderedSpacer'

export function SpacerBlockComponent({ block }: { block: SpacerBlock }) {
  return (
    <div className="relative border border-dashed border-gray-200 bg-gray-50/30 flex items-center justify-center min-h-[24px]">
      <div className="text-xs text-gray-400 absolute opacity-0 hover:opacity-100 transition-opacity">Spacer ({block.height}px)</div>
      <RenderedSpacer block={block} />
    </div>
  )
}
