import type { SpacerBlock } from '../../types/template.types'

export function RenderedSpacer({ block }: { block: SpacerBlock }) {
  return (
    <div style={{ height: `${block.height}px`, width: '100%' }} />
  )
}
