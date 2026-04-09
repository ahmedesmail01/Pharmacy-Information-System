import type { JSONContent } from '@tiptap/react'

// ─── Text style shared across blocks ────────────────────────────────────────

export interface TextStyle {
  fontSize?: 'sm' | 'base' | 'lg' | 'xl' | '2xl' | '3xl'
  fontWeight?: 'normal' | 'medium' | 'semibold' | 'bold'
  textAlign?: 'left' | 'center' | 'right'
  color?: string
}

// ─── Block definitions ───────────────────────────────────────────────────────

export interface TitleBlock {
  id: string
  type: 'title'
  content: JSONContent          // Tiptap JSON
  style: TextStyle
}

export interface TextBlock {
  id: string
  type: 'text'
  content: JSONContent          // Tiptap JSON (supports bold, italic, lists)
}

export interface ColumnDef {
  id: string
  label: string                 // e.g. "Bill To"
  width: number                 // flex-grow proportion, e.g. 1, 2, 1
  blocks: TemplateBlock[]       // nested blocks inside this column
}

export interface ColumnsBlock {
  id: string
  type: 'columns'
  columns: ColumnDef[]
  gap?: number                  // gap in px, default 24
}

export interface TableColumnDef {
  id: string
  key: string                   // matches runtime data field, e.g. "description"
  label: string                 // e.g. "Description"
  width?: number                // flex proportion
  align?: 'left' | 'center' | 'right'
  format?: 'text' | 'currency' | 'number' | 'date'
}

export interface TableColumnsBlock {
  id: string
  type: 'table'
  columns: TableColumnDef[]
  showHeader?: boolean
  showTotal?: boolean
  totalLabel?: string
  totalField?: string           // which column to sum, e.g. "total"
  stripeRows?: boolean
}

export interface DividerBlock {
  id: string
  type: 'divider'
  style?: 'solid' | 'dashed' | 'dotted'
  color?: string
}

export interface SpacerBlock {
  id: string
  type: 'spacer'
  height: number                // in px
}

export interface HeaderMetaBlock {
  id: string
  type: 'header-meta'
  showLogo?: boolean
  logoUrl?: string
  showInvoiceNumber?: boolean
  invoiceNumberLabel?: string
  showDate?: boolean
  dateLabel?: string
  showDueDate?: boolean
  dueDateLabel?: string
}

// ─── Union type ──────────────────────────────────────────────────────────────

export type TemplateBlock =
  | TitleBlock
  | TextBlock
  | ColumnsBlock
  | TableColumnsBlock
  | DividerBlock
  | SpacerBlock
  | HeaderMetaBlock

export type BlockType = TemplateBlock['type']

// ─── Template root ───────────────────────────────────────────────────────────

export interface TemplateMeta {
  paperSize?: 'A4' | 'Letter'
  margins?: { top: number; right: number; bottom: number; left: number }
  primaryColor?: string
  fontFamily?: string
  currency?: string             // Added based on constraints
}

export interface InvoiceTemplate {
  id?: string                   // undefined when creating new
  name: string
  description?: string
  version: number
  meta: TemplateMeta
  blocks: TemplateBlock[]
  createdAt?: string
  updatedAt?: string
}

// ─── Runtime data (for renderer) ─────────────────────────────────────────────

export interface InvoiceData {
  invoiceNumber?: string
  date?: string
  dueDate?: string
  logoUrl?: string
  from?: Record<string, string>
  to?: Record<string, string>
  lineItems?: Record<string, unknown>[]
  totals?: Record<string, number>
  notes?: string
  [key: string]: unknown        // allow arbitrary fields
}
