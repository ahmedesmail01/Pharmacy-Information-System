import type { InvoiceTemplate, InvoiceData, TemplateBlock } from '../types/template.types'
import { RenderedTitle } from './blocks/RenderedTitle'
import { RenderedText } from './blocks/RenderedText'
import { RenderedColumns } from './blocks/RenderedColumns'
import { RenderedTable } from './blocks/RenderedTable'
import { RenderedDivider } from './blocks/RenderedDivider'
import { RenderedSpacer } from './blocks/RenderedSpacer'
import { RenderedHeaderMeta } from './blocks/RenderedHeaderMeta'

interface InvoiceRendererProps {
  template: InvoiceTemplate
  data?: InvoiceData
  className?: string
}

export function InvoiceRenderer({ template, data = {}, className = '' }: InvoiceRendererProps) {
  
  const renderBlock = (block: TemplateBlock): React.ReactNode => {
    switch (block.type) {
      case 'title':
        return <RenderedTitle key={block.id} block={block} data={data} />
      case 'text':
        return <RenderedText key={block.id} block={block} data={data} />
      case 'columns':
        return <RenderedColumns key={block.id} block={block} data={data} meta={template.meta} renderBlock={renderBlock} />
      case 'table':
        return <RenderedTable key={block.id} block={block} data={data} meta={template.meta} />
      case 'divider':
        return <RenderedDivider key={block.id} block={block} />
      case 'spacer':
        return <RenderedSpacer key={block.id} block={block} />
      case 'header-meta':
        return <RenderedHeaderMeta key={block.id} block={block} data={data} meta={template.meta} />
      default:
        return null
    }
  }

  return (
    <div 
      className={`invoice-renderer bg-white text-gray-900 mx-auto ${className}`}
      style={{
        width: template.meta.paperSize === 'Letter' ? '816px' : '794px', // Standard pixel width at 96dpi
        minHeight: template.meta.paperSize === 'Letter' ? '1056px' : '1123px',
        paddingTop: `${template.meta.margins?.top || 40}px`,
        paddingRight: `${template.meta.margins?.right || 40}px`,
        paddingBottom: `${template.meta.margins?.bottom || 40}px`,
        paddingLeft: `${template.meta.margins?.left || 40}px`,
        fontFamily: template.meta.fontFamily || 'Inter, sans-serif',
        boxSizing: 'border-box'
      }}
    >
      <div className="flex flex-col w-full h-full">
        {template.blocks.map(renderBlock)}
      </div>
    </div>
  )
}
