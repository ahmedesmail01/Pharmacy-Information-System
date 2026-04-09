import { nanoid } from 'nanoid'
import type { TemplateBlock, BlockType } from '../types/template.types'

export function createBlock(type: BlockType): TemplateBlock {
  const id = nanoid()

  switch (type) {
    case 'title':
      return {
        id, type: 'title',
        content: { type: 'doc', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Invoice' }] }] },
        style: { fontSize: '3xl', fontWeight: 'bold', textAlign: 'left' },
      }

    case 'text':
      return {
        id, type: 'text',
        content: { type: 'doc', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Add your text here...' }] }] },
      }

    case 'columns':
      return {
        id, type: 'columns',
        gap: 24,
        columns: [
          { id: nanoid(), label: 'Left', width: 1, blocks: [] },
          { id: nanoid(), label: 'Right', width: 1, blocks: [] },
        ],
      }

    case 'table':
      return {
        id, type: 'table',
        showHeader: true,
        showTotal: true,
        totalLabel: 'Total',
        totalField: 'total',
        stripeRows: true,
        columns: [
          { id: nanoid(), key: 'description', label: 'Description', width: 3, align: 'left', format: 'text' },
          { id: nanoid(), key: 'quantity', label: 'Qty', width: 1, align: 'center', format: 'number' },
          { id: nanoid(), key: 'unitPrice', label: 'Unit Price', width: 1, align: 'right', format: 'currency' },
          { id: nanoid(), key: 'total', label: 'Total', width: 1, align: 'right', format: 'currency' },
        ],
      }

    case 'divider':
      return { id, type: 'divider', style: 'solid', color: '#e2e8f0' }

    case 'spacer':
      return { id, type: 'spacer', height: 24 }

    case 'header-meta':
      return {
        id, type: 'header-meta',
        showLogo: true,
        showInvoiceNumber: true,
        invoiceNumberLabel: 'Invoice #',
        showDate: true,
        dateLabel: 'Date',
        showDueDate: true,
        dueDateLabel: 'Due Date',
      }
  }
}
