import type { HeaderMetaBlock } from '../../types/template.types'
import { RenderedHeaderMeta } from '../../renderer/blocks/RenderedHeaderMeta'
import { useTemplateStore } from '../../store/templateStore'

export function HeaderMetaBlockComponent({ block }: { block: HeaderMetaBlock }) {
  const meta = useTemplateStore(s => s.template.meta)
  // Show placeholder data for builder
  const fakeData = {
    invoiceNumber: 'INV-12345',
    date: '2023-10-25',
    dueDate: '2023-11-25',
    logoUrl: '' // Empty so it shows the "Logo" placeholder box
  }
  return <RenderedHeaderMeta block={block} data={fakeData} meta={meta} />
}
