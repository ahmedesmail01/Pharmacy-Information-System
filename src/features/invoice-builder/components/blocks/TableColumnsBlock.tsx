import type { TableColumnsBlock } from '../../types/template.types'

interface Props {
  block: TableColumnsBlock
}

export function TableColumnsBlockComponent({ block }: Props) {
  // Builder view shows the table STRUCTURE (column headers only, no data rows)
  // with a "preview" row of placeholder content
  return (
    <div className="w-full border border-dashed border-gray-200 rounded">
      <table className="w-full text-sm text-left table-fixed">
        {block.showHeader && (
          <thead className="text-xs uppercase bg-gray-50 border-b border-gray-200 text-gray-500">
            <tr>
              {block.columns.map((col) => (
                <th 
                  key={col.id} 
                  className={`px-4 py-3 text-${col.align || 'left'}`}
                  style={{ width: col.width ? `${col.width * 10}%` : 'auto' }}
                >
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
        )}
        <tbody>
          <tr className="border-b border-gray-100 bg-white opacity-50">
             {block.columns.map((col) => (
                <td key={`data1-${col.id}`} className={`px-4 py-3 text-${col.align || 'left'}`}>
                  [Data {col.label}]
                </td>
             ))}
          </tr>
          {block.stripeRows && (
            <tr className="border-b border-gray-100 bg-gray-50 opacity-50">
              {block.columns.map((col) => (
                  <td key={`data2-${col.id}`} className={`px-4 py-3 text-${col.align || 'left'}`}>
                    [Data {col.label}]
                  </td>
              ))}
            </tr>
          )}
        </tbody>
        {block.showTotal && (
          <tfoot>
            <tr className="border-t-2 border-gray-200 font-semibold bg-gray-50/50">
              <td 
                colSpan={block.columns.length - 1} 
                className="px-4 py-4 text-right"
              >
                {block.totalLabel || 'Total'}:
              </td>
              <td className={`px-4 py-4 text-${block.columns[block.columns.length - 1]?.align || 'right'}`}>
                [Total Sum]
              </td>
            </tr>
          </tfoot>
        )}
      </table>
    </div>
  )
}
