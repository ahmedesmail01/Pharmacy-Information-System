import { useMemo } from 'react'
import type { TableColumnsBlock, InvoiceData, TemplateMeta } from '../../types/template.types'

interface Props {
  block: TableColumnsBlock
  data: InvoiceData
  meta: TemplateMeta
}

export function RenderedTable({ block, data, meta }: Props) {
  const lineItems = (data.lineItems || []) as Record<string, unknown>[]

  const formatValue = (val: unknown, format: string | undefined) => {
    if (val === undefined || val === null) return ''
    if (format === 'currency') {
      const num = Number(val)
      if (isNaN(num)) return String(val)
      return new Intl.NumberFormat(undefined, { 
        style: 'currency', 
        currency: meta.currency || 'USD' 
      }).format(num)
    }
    if (format === 'number') {
      const num = Number(val)
      if (isNaN(num)) return String(val)
      return new Intl.NumberFormat().format(num)
    }
    if (format === 'date') {
      const d = new Date(String(val))
      if (isNaN(d.getTime())) return String(val)
      return new Intl.DateTimeFormat().format(d)
    }
    return String(val)
  }

  const totalSum = useMemo(() => {
    if (!block.showTotal || !block.totalField) return 0
    return lineItems.reduce((acc, item) => {
      const val = Number(item[block.totalField!])
      return acc + (isNaN(val) ? 0 : val)
    }, 0)
  }, [lineItems, block.showTotal, block.totalField])

  return (
    <div className="w-full">
      <table className="w-full text-sm text-left table-fixed">
        {block.showHeader && (
          <thead className="text-xs uppercase bg-gray-50 border-b border-gray-200" style={{ color: meta.primaryColor }}>
            <tr>
              {block.columns.map((col) => (
                <th 
                  key={col.id} 
                  className={`px-4 py-3 text-${col.align || 'left'}`}
                  style={{ width: col.width ? `${col.width * 10}%` : 'auto' }} // Simple proportion
                >
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
        )}
        <tbody>
          {lineItems.map((item, idx) => (
            <tr 
              key={idx} 
              className={`border-b border-gray-100 ${block.stripeRows && idx % 2 === 1 ? 'bg-gray-50/50' : 'bg-white'}`}
            >
              {block.columns.map((col) => (
                <td key={col.id} className={`px-4 py-3 text-${col.align || 'left'}`}>
                  {formatValue(item[col.key], col.format)}
                </td>
              ))}
            </tr>
          ))}
          {lineItems.length === 0 && (
             <tr>
               <td colSpan={block.columns.length} className="px-4 py-8 text-center text-gray-400 italic">
                 No items
               </td>
             </tr>
          )}
        </tbody>
        {block.showTotal && (
          <tfoot>
            <tr className="border-t-2 border-gray-200 font-semibold">
              <td 
                colSpan={block.columns.length - 1} 
                className="px-4 py-4 text-right"
              >
                {block.totalLabel || 'Total'}:
              </td>
              <td className={`px-4 py-4 text-${block.columns[block.columns.length - 1]?.align || 'right'}`}>
                {formatValue(totalSum, 'currency')}
              </td>
            </tr>
          </tfoot>
        )}
      </table>
    </div>
  )
}
