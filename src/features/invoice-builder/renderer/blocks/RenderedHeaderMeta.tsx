import type { HeaderMetaBlock, InvoiceData, TemplateMeta } from '../../types/template.types'

interface Props {
  block: HeaderMetaBlock
  data: InvoiceData
  meta: TemplateMeta
}

export function RenderedHeaderMeta({ block, data, meta }: Props) {
  return (
    <div className="flex justify-between items-start mb-8 w-full">
      <div className="flex flex-col gap-4">
        {block.showLogo && (data.logoUrl || '') ? (
          <img 
            src={data.logoUrl} 
            alt="Logo" 
            className="object-contain h-16 w-auto" 
            style={{ maxWidth: '200px' }}
          />
        ) : (
          block.showLogo && <div className="h-16 w-32 bg-gray-100 flex items-center justify-center text-gray-400 text-sm">Logo</div>
        )}
      </div>

      <div className="flex flex-col items-end gap-1 text-right">
        {block.showInvoiceNumber && (
          <div className="text-xl">
             <span className="font-semibold mr-2">{block.invoiceNumberLabel || 'Invoice #'}:</span>
             <span>{data.invoiceNumber || 'INV-0000'}</span>
          </div>
        )}
        {block.showDate && (
          <div className="text-gray-600">
             <span className="font-medium mr-2">{block.dateLabel || 'Date'}:</span>
             <span>{data.date || new Date().toLocaleDateString()}</span>
          </div>
        )}
        {block.showDueDate && (
          <div className="text-gray-600">
             <span className="font-medium mr-2">{block.dueDateLabel || 'Due Date'}:</span>
             <span>{data.dueDate || '-'}</span>
          </div>
        )}
      </div>
    </div>
  )
}
