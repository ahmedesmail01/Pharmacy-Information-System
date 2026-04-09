import type { DividerBlock } from '../../types/template.types'
import { RenderedDivider } from '../../renderer/blocks/RenderedDivider'

export function DividerBlockComponent({ block }: { block: DividerBlock }) {
  return <RenderedDivider block={block} />
}
