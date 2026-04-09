# Invoice Template Builder — Implementation Prompt

## Context

I have a React + TypeScript + Vite app. I need you to implement a **dynamic invoice template builder** feature inside it. This is a full-featured UI that lets users visually compose invoice templates using blocks, configure each block, reorder them, and save the resulting template as JSON to a backend API.

The feature has two modes:
- **Builder mode** — the editor where templates are created/edited
- **Renderer mode** — a shared component that takes `template + data` and renders the actual invoice (used in previews, PDFs, emails, etc.)

---

## Tech stack to install and use

```bash
# Drag and drop
npm install @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities

# Rich text editor
npm install @tiptap/react @tiptap/starter-kit @tiptap/extension-text-align @tiptap/extension-color @tiptap/extension-text-style @tiptap/extension-placeholder

# State management
npm install zustand

# Unique IDs
npm install nanoid
```

Do NOT use react-beautiful-dnd (deprecated), Quill, or Slate.

---

## Folder structure to create

Create everything under `src/features/invoice-builder/`:

```
src/features/invoice-builder/
  types/
    template.types.ts         ← all TypeScript types
  store/
    templateStore.ts          ← Zustand store
  utils/
    serializer.ts             ← store state → API payload
    blockDefaults.ts          ← factory functions for new blocks
  components/
    InvoiceBuilder.tsx        ← root builder component (layout shell)
    BuilderCanvas.tsx         ← sortable droppable block list
    BlockSidebar.tsx          ← palette of block types to drag/add
    PropertiesPanel.tsx       ← right panel, context-sensitive to selected block
    BlockWrapper.tsx          ← selection outline + drag handle + delete
    blocks/
      TitleBlock.tsx
      TextBlock.tsx
      ColumnsBlock.tsx
      TableColumnsBlock.tsx
      DividerBlock.tsx
      SpacerBlock.tsx
      HeaderMetaBlock.tsx     ← invoice number, date, logo row
    properties/
      TitleBlockProps.tsx
      TextBlockProps.tsx
      ColumnsBlockProps.tsx
      TableColumnsBlockProps.tsx
      SpacerBlockProps.tsx
  renderer/
    InvoiceRenderer.tsx       ← pure render from template + data, no editor chrome
    blocks/
      RenderedTitle.tsx
      RenderedText.tsx
      RenderedColumns.tsx
      RenderedTable.tsx
      RenderedDivider.tsx
      RenderedSpacer.tsx
      RenderedHeaderMeta.tsx
  index.ts                    ← public exports
```

---

## Types — implement exactly as specified

File: `src/features/invoice-builder/types/template.types.ts`

```typescript
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
```

---

## Zustand store — implement exactly as specified

File: `src/features/invoice-builder/store/templateStore.ts`

```typescript
import { create } from 'zustand'
import { temporal } from 'zundo'          // optional undo/redo, install if desired
import type { InvoiceTemplate, TemplateBlock, TemplateMeta } from '../types/template.types'

interface TemplateStore {
  // State
  template: InvoiceTemplate
  selectedBlockId: string | null
  isDirty: boolean
  isSaving: boolean

  // Template-level actions
  setTemplateName: (name: string) => void
  setTemplateMeta: (meta: Partial<TemplateMeta>) => void
  loadTemplate: (template: InvoiceTemplate) => void
  resetTemplate: () => void

  // Block actions
  addBlock: (block: TemplateBlock, afterId?: string) => void
  updateBlock: (id: string, updates: Partial<TemplateBlock>) => void
  removeBlock: (id: string) => void
  reorderBlocks: (orderedIds: string[]) => void
  duplicateBlock: (id: string) => void

  // Selection
  selectBlock: (id: string | null) => void

  // Persistence
  setSaving: (saving: boolean) => void
  markClean: () => void
}

const defaultTemplate = (): InvoiceTemplate => ({
  name: 'Untitled Template',
  version: 1,
  meta: {
    paperSize: 'A4',
    margins: { top: 40, right: 40, bottom: 40, left: 40 },
    primaryColor: '#1a1a2e',
  },
  blocks: [],
})

export const useTemplateStore = create<TemplateStore>((set, get) => ({
  template: defaultTemplate(),
  selectedBlockId: null,
  isDirty: false,
  isSaving: false,

  setTemplateName: (name) =>
    set((s) => ({ template: { ...s.template, name }, isDirty: true })),

  setTemplateMeta: (meta) =>
    set((s) => ({
      template: { ...s.template, meta: { ...s.template.meta, ...meta } },
      isDirty: true,
    })),

  loadTemplate: (template) =>
    set({ template, selectedBlockId: null, isDirty: false }),

  resetTemplate: () =>
    set({ template: defaultTemplate(), selectedBlockId: null, isDirty: false }),

  addBlock: (block, afterId) =>
    set((s) => {
      const blocks = [...s.template.blocks]
      if (afterId) {
        const idx = blocks.findIndex((b) => b.id === afterId)
        blocks.splice(idx + 1, 0, block)
      } else {
        blocks.push(block)
      }
      return { template: { ...s.template, blocks }, isDirty: true }
    }),

  updateBlock: (id, updates) =>
    set((s) => ({
      template: {
        ...s.template,
        blocks: s.template.blocks.map((b) =>
          b.id === id ? ({ ...b, ...updates } as TemplateBlock) : b
        ),
      },
      isDirty: true,
    })),

  removeBlock: (id) =>
    set((s) => ({
      template: {
        ...s.template,
        blocks: s.template.blocks.filter((b) => b.id !== id),
      },
      selectedBlockId: s.selectedBlockId === id ? null : s.selectedBlockId,
      isDirty: true,
    })),

  reorderBlocks: (orderedIds) =>
    set((s) => {
      const blockMap = new Map(s.template.blocks.map((b) => [b.id, b]))
      const blocks = orderedIds.map((id) => blockMap.get(id)!).filter(Boolean)
      return { template: { ...s.template, blocks }, isDirty: true }
    }),

  duplicateBlock: (id) => {
    const { template, addBlock } = get()
    const block = template.blocks.find((b) => b.id === id)
    if (!block) return
    const { nanoid } = require('nanoid')
    const duplicate = { ...block, id: nanoid() }
    addBlock(duplicate as TemplateBlock, id)
  },

  selectBlock: (id) => set({ selectedBlockId: id }),

  setSaving: (isSaving) => set({ isSaving }),
  markClean: () => set({ isDirty: false }),
}))
```

---

## Block defaults factory

File: `src/features/invoice-builder/utils/blockDefaults.ts`

```typescript
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
```

---

## Serializer

File: `src/features/invoice-builder/utils/serializer.ts`

```typescript
import type { InvoiceTemplate } from '../types/template.types'

export function serializeTemplate(template: InvoiceTemplate): string {
  return JSON.stringify({ ...template, version: (template.version ?? 1) })
}

export function deserializeTemplate(json: string): InvoiceTemplate {
  return JSON.parse(json) as InvoiceTemplate
}

export async function saveTemplate(
  template: InvoiceTemplate,
  apiUrl: string
): Promise<InvoiceTemplate> {
  const method = template.id ? 'PUT' : 'POST'
  const url = template.id ? `${apiUrl}/${template.id}` : apiUrl

  const res = await fetch(url, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: serializeTemplate({ ...template, updatedAt: new Date().toISOString() }),
  })

  if (!res.ok) throw new Error(`Failed to save template: ${res.statusText}`)
  return res.json()
}
```

---

## Root builder component

File: `src/features/invoice-builder/components/InvoiceBuilder.tsx`

```tsx
// This is the layout shell. It renders three panels side by side:
// [BlockSidebar | BuilderCanvas | PropertiesPanel]
// It also renders the top toolbar with template name input and Save button.

// Props:
interface InvoiceBuilderProps {
  templateId?: string           // if provided, load this template on mount
  apiUrl: string                // base URL for template CRUD, e.g. "/api/templates"
  onSaved?: (template: InvoiceTemplate) => void
}

// Behavior:
// - On mount, if templateId is given, GET apiUrl/templateId and call loadTemplate()
// - Save button calls saveTemplate() from serializer, then markClean()
// - Show unsaved indicator in the toolbar when isDirty === true
// - Clicking outside any block calls selectBlock(null)
// - Layout: use CSS grid with columns: 220px 1fr 280px, full viewport height
// - Include a "Preview" toggle button that switches canvas to show <InvoiceRenderer> with mock data
```

---

## Canvas component

File: `src/features/invoice-builder/components/BuilderCanvas.tsx`

```tsx
// Uses @dnd-kit/core DndContext + @dnd-kit/sortable SortableContext
// Renders the template.blocks array as a vertical sortable list
// Each block is wrapped in <BlockWrapper> which provides:
//   - drag handle (left side, visible on hover)
//   - selection ring (blue outline when selectedBlockId matches)
//   - action bar on hover: [Duplicate] [Delete] [Move up] [Move down]
// When a block is clicked, call selectBlock(block.id)
// When sort ends, call reorderBlocks(newOrder)
// 
// Canvas has an "Add block" zone at the bottom that opens a mini menu
// of block types. Clicking one calls createBlock(type) then addBlock()
//
// Canvas background should look like a paper sheet (white, subtle shadow)
// centered on a gray background, max-width 794px (A4 width at 96dpi)
```

---

## Block sidebar

File: `src/features/invoice-builder/components/BlockSidebar.tsx`

```tsx
// Left panel listing available block types as drag sources
// Uses @dnd-kit/core useDraggable
// Block type entries (show icon + label):
//   - Header meta   → layout/header icon
//   - Title         → text heading icon
//   - Text          → paragraph icon
//   - Two columns   → columns icon (add 'columns' block with 2 cols)
//   - Three columns → columns icon (add 'columns' block with 3 cols)
//   - Line items table → table icon
//   - Divider       → minus icon
//   - Spacer        → arrows-vertical icon
//
// Clicking a block type adds it to the end of the canvas (don't require drag)
// Dragging a block type and dropping onto the canvas inserts it at drop position
```

---

## Properties panel

File: `src/features/invoice-builder/components/PropertiesPanel.tsx`

```tsx
// Right panel. Shows different content based on selectedBlockId:
// - null → show template-level settings (name, paper size, margins, primary color, font)
// - a block id → show the matching <*BlockProps> component for that block type
//
// Each <*BlockProps> component receives the block and calls updateBlock() on change
// Use controlled inputs — every change is live-applied to the store (no Save within props)
```

---

## Text / Title block components (builder side)

File: `src/features/invoice-builder/components/blocks/TextBlock.tsx`
File: `src/features/invoice-builder/components/blocks/TitleBlock.tsx`

```tsx
// Both use a Tiptap <EditorContent> instance
// TitleBlock: single-line feel, larger font, StarterKit minus lists
// TextBlock: full StarterKit, support bold/italic/bullet/ordered list
//
// Tiptap editor config:
//   extensions: [StarterKit, TextAlign.configure({ types: ['heading', 'paragraph'] }), TextStyle, Color]
//
// On editor update (editor.on('update')):
//   updateBlock(block.id, { content: editor.getJSON() })
//
// IMPORTANT: initialize the editor with the block's existing content:
//   content: block.content
// and do NOT reinitialize if the block id hasn't changed (use useEffect with [block.id])
//
// In BUILDER mode: editor is always editable
// In RENDERER mode: use generateHTML(block.content, extensions) to produce static HTML
```

---

## Columns block (builder side)

File: `src/features/invoice-builder/components/blocks/ColumnsBlock.tsx`

```tsx
// Renders block.columns as a flex row
// Each column is a droppable zone that can accept blocks dragged from the sidebar
// Each column renders its own nested blocks using the same block rendering switch
// The column label ("Bill To", "Ship To", etc.) is shown as a small gray label above
//
// In PropertiesPanel for a columns block:
//   - Add column / Remove column buttons
//   - Rename each column label
//   - Adjust each column width (number input, used as flex-grow)
//   - Adjust gap between columns
```

---

## Table columns block (builder side)

File: `src/features/invoice-builder/components/blocks/TableColumnsBlock.tsx`

```tsx
// Builder view shows the table STRUCTURE (column headers only, no data rows)
// with a "preview" row of placeholder content
//
// In PropertiesPanel for a table block:
//   - Add column / Remove column
//   - Per column: key (field name), label, align, format, width
//   - Columns should be reorderable via @dnd-kit/sortable
//   - Toggle: show header, show total, stripe rows
//   - Total field selector (which column key to sum)
//   - Total label input
```

---

## InvoiceRenderer — shared pure renderer

File: `src/features/invoice-builder/renderer/InvoiceRenderer.tsx`

```tsx
// Props:
interface InvoiceRendererProps {
  template: InvoiceTemplate
  data?: InvoiceData            // if omitted, show placeholder values
  className?: string
}

// Renders each block in template.blocks using a switch on block.type
// Maps each type to its RenderedX component
// Applies template.meta (margins, primaryColor, fontFamily) as inline styles on root div
//
// Field interpolation for text/title blocks:
// Before rendering Tiptap HTML, walk the JSONContent tree and replace
// any text node matching the pattern {{field}} with data[field] ?? `{{field}}`
// Use a recursive helper: interpolateContent(json: JSONContent, data: InvoiceData): JSONContent
//
// RenderedTable: receives block + data.lineItems[]
//   - renders thead with column labels
//   - renders tbody rows from lineItems, applying column.format to values
//   - if showTotal: render a tfoot row summing the totalField column
//   - currency format: Intl.NumberFormat for locale-aware formatting
//
// This component is used:
//   1. In the builder canvas when Preview mode is active
//   2. In other parts of the app to render actual invoices
//   3. As the basis for PDF export (wrap in a print stylesheet)
```

---

## Field token system

Implement `{{token}}` support in Tiptap text blocks:

```
Supported tokens (suggest these in a tooltip/picker in the properties panel):
  {{invoiceNumber}}   {{date}}          {{dueDate}}
  {{from.name}}       {{from.address}}  {{from.email}}
  {{to.name}}         {{to.address}}    {{to.email}}
  {{notes}}
```

In the builder TextBlock/TitleBlock, add a "Insert field" dropdown button in the Tiptap toolbar. Clicking a field inserts the `{{token}}` string at cursor position. The builder renders these as highlighted chips (use a Tiptap Mark extension named `fieldToken` that styles with a light blue background). In the renderer, replace them with actual values from `InvoiceData`.

---

## Tiptap toolbar component

Build a `TiptapToolbar.tsx` component that renders above each editor:

```
[Bold] [Italic] [Align L/C/R] | [Insert field ▾]
```

Show this toolbar only when the block is selected (selectedBlockId matches). Keep it minimal. For the TitleBlock, omit list buttons.

---

## Block wrapper

File: `src/features/invoice-builder/components/BlockWrapper.tsx`

```tsx
// Wraps every top-level block in the canvas
// Uses @dnd-kit/sortable useSortable hook
// On hover: show drag handle on left edge, action buttons on top-right
// When selected (selectedBlockId === block.id): show a 2px blue ring
// Action buttons: [↑ Move up] [↓ Move down] [⧉ Duplicate] [🗑 Delete]
// Click anywhere inside block → selectBlock(block.id)
// Clicking the drag handle sets up drag interaction
```

---

## Suggested styling approach

Use **Tailwind CSS** (assumed to be in the project). If not present, use CSS modules.

Key classes to apply:
- Canvas sheet: `bg-white shadow-lg mx-auto` with padding from `template.meta.margins`
- Builder shell: `h-screen flex overflow-hidden bg-gray-100`
- Sidebar: `w-56 bg-white border-r border-gray-200 flex-shrink-0 overflow-y-auto`
- Canvas area: `flex-1 overflow-y-auto p-8`
- Properties panel: `w-72 bg-white border-l border-gray-200 flex-shrink-0 overflow-y-auto`
- Selected block ring: `ring-2 ring-blue-500 ring-offset-1`
- Block hover: `hover:ring-1 hover:ring-blue-300`

---

## Usage example

```tsx
// In your app, use like this:
import { InvoiceBuilder } from '@/features/invoice-builder'

function TemplatesPage() {
  return (
    <InvoiceBuilder
      apiUrl="/api/templates"
      onSaved={(template) => console.log('Saved:', template.id)}
    />
  )
}

// To render a saved template elsewhere:
import { InvoiceRenderer } from '@/features/invoice-builder'

function InvoicePage({ template, invoice }) {
  return <InvoiceRenderer template={template} data={invoice} />
}
```

---

## Implementation order (do it in this sequence)

1. `types/template.types.ts`
2. `store/templateStore.ts`
3. `utils/blockDefaults.ts` + `utils/serializer.ts`
4. `renderer/InvoiceRenderer.tsx` and all `renderer/blocks/*.tsx`
5. `components/BlockWrapper.tsx`
6. `components/blocks/TitleBlock.tsx` + `TextBlock.tsx` (with Tiptap)
7. `components/blocks/ColumnsBlock.tsx`
8. `components/blocks/TableColumnsBlock.tsx`
9. `components/blocks/DividerBlock.tsx` + `SpacerBlock.tsx` + `HeaderMetaBlock.tsx`
10. `components/BlockSidebar.tsx`
11. `components/PropertiesPanel.tsx` + all `components/properties/*.tsx`
12. `components/BuilderCanvas.tsx` (with dnd-kit)
13. `components/InvoiceBuilder.tsx` (root shell + toolbar + API calls)
14. `index.ts` public exports

---

## Constraints and rules

- **Do not** put any editor chrome (drag handles, selection rings) in the renderer. The renderer must produce clean, printable HTML.
- **Do not** store React components in the template JSON. The schema must be 100% serializable plain objects.
- **Do not** use `any` types. Use the union types defined above everywhere.
- The `ColumnsBlock` in the builder must support nested blocks, but nested blocks can only be of types: `title`, `text`, `divider`, `spacer`. No nested columns or tables.
- The Tiptap editor instance must be destroyed and recreated when the block `id` changes. Use `key={block.id}` on the editor wrapper.
- All currency formatting must use `Intl.NumberFormat` — no hardcoded `$` symbols. The currency locale should come from `template.meta` (add a `currency?: string` field, defaulting to `'USD'`).
- The store must be the single source of truth. No local component state for block content — always sync immediately to the store via `updateBlock`.
