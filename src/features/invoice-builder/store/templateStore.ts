import { create } from 'zustand'
import { temporal } from 'zundo'
import { nanoid } from 'nanoid'
import type { InvoiceTemplate, TemplateBlock, TemplateMeta, ColumnsBlock } from '../types/template.types'

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
  addBlock: (block: TemplateBlock, afterId?: string, parentColumnId?: string) => void
  updateBlock: (id: string, updates: Partial<TemplateBlock>) => void
  removeBlock: (id: string) => void
  reorderBlocks: (orderedIds: string[], parentColumnId?: string) => void
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
    currency: 'USD',
  },
  blocks: [],
})

export const useTemplateStore = create<TemplateStore>()(
  temporal((set, get) => ({
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

    addBlock: (block, afterId, parentColumnId) =>
      set((s) => {
        const blocks = [...s.template.blocks]

        if (parentColumnId) {
          // Find the columns block that contains this column
          for (const topBlock of blocks) {
            if (topBlock.type === 'columns') {
              const col = topBlock.columns.find(c => c.id === parentColumnId)
              if (col) {
                const newColBlocks = [...col.blocks]
                if (afterId) {
                  const idx = newColBlocks.findIndex((b) => b.id === afterId)
                  if (idx !== -1) {
                    newColBlocks.splice(idx + 1, 0, block)
                  } else {
                    newColBlocks.push(block)
                  }
                } else {
                  newColBlocks.push(block)
                }
                const newColumns = topBlock.columns.map(c => 
                  c.id === parentColumnId ? { ...c, blocks: newColBlocks } : c
                )
                
                // We recursively map to find the column block and update it.
                // Simple version assuming only 1 level of columns
                const rootIdx = blocks.findIndex(b => b.id === topBlock.id)
                blocks[rootIdx] = { ...topBlock, columns: newColumns }
                return { template: { ...s.template, blocks }, isDirty: true }
              }
            }
          }
        } else {
          // Add to root blocks
          if (afterId) {
            const idx = blocks.findIndex((b) => b.id === afterId)
            if (idx !== -1) {
              blocks.splice(idx + 1, 0, block)
            } else {
              blocks.push(block)
            }
          } else {
            blocks.push(block)
          }
        }
        return { template: { ...s.template, blocks }, isDirty: true }
      }),

    updateBlock: (id, updates) =>
      set((s) => {
        // Recursive helper to update a block
        const updateInBlocks = (blocks: TemplateBlock[]): TemplateBlock[] => {
          return blocks.map(b => {
            if (b.id === id) {
              return { ...b, ...updates } as TemplateBlock
            }
            if (b.type === 'columns') {
              return {
                ...b,
                columns: b.columns.map(col => ({
                  ...col,
                  blocks: updateInBlocks(col.blocks)
                }))
              }
            }
            return b
          })
        }
        
        return {
          template: {
            ...s.template,
            blocks: updateInBlocks(s.template.blocks),
          },
          isDirty: true,
        }
      }),

    removeBlock: (id) =>
      set((s) => {
        // Recursive helper to remove a block
        let removed = false;
        const removeInBlocks = (blocks: TemplateBlock[]): TemplateBlock[] => {
          return blocks.filter(b => {
             if (b.id === id) {
               removed = true;
               return false;
             }
             return true;
          }).map(b => {
            if (b.type === 'columns') {
               return {
                 ...b,
                 columns: b.columns.map(col => ({
                   ...col,
                   blocks: removeInBlocks(col.blocks)
                 }))
               }
            }
            return b;
          })
        }

        const newBlocks = removeInBlocks(s.template.blocks)

        return {
          template: {
            ...s.template,
            blocks: newBlocks,
          },
          selectedBlockId: s.selectedBlockId === id ? null : s.selectedBlockId,
          isDirty: true, // Only mark dirty if it was actually in the tree
        }
      }),

    reorderBlocks: (orderedIds, parentColumnId) =>
      set((s) => {
        if (parentColumnId) {
           // Reorder blocks inside a specific column
           const blocks = [...s.template.blocks]
           for (const topBlock of blocks) {
            if (topBlock.type === 'columns') {
              const col = topBlock.columns.find(c => c.id === parentColumnId)
              if (col) {
                const blockMap = new Map(col.blocks.map(b => [b.id, b]))
                const newColBlocks = orderedIds.map(id => blockMap.get(id)!).filter(Boolean)
                const newColumns = topBlock.columns.map(c => 
                  c.id === parentColumnId ? { ...c, blocks: newColBlocks } : c
                )
                const rootIdx = blocks.findIndex(b => b.id === topBlock.id)
                blocks[rootIdx] = { ...topBlock, columns: newColumns }
                return { template: { ...s.template, blocks }, isDirty: true }
              }
            }
          }
          return s
        } else {
          // Reorder root level blocks
          const blockMap = new Map(s.template.blocks.map((b) => [b.id, b]))
          const blocks = orderedIds.map((id) => blockMap.get(id)!).filter(Boolean)
          return { template: { ...s.template, blocks }, isDirty: true }
        }
      }),

    duplicateBlock: (id) => {
      const { template, addBlock } = get()
      
      let blockToDuplicate: TemplateBlock | undefined;
      let parentColId: string | undefined;

      const findBlock = (blocks: TemplateBlock[], colId?: string) => {
         for (const b of blocks) {
           if (b.id === id) {
             blockToDuplicate = b;
             parentColId = colId;
             return;
           }
           if (b.type === 'columns') {
             b.columns.forEach(col => findBlock(col.blocks, col.id))
           }
         }
      }
      findBlock(template.blocks)
      
      if (!blockToDuplicate) return

      // Deep copy with new IDs to prevent reference issues
      const deepDuplicate = (b: TemplateBlock): TemplateBlock => {
         if (b.type === 'columns') {
            return {
               ...b,
               id: nanoid(),
               columns: b.columns.map(col => ({
                  ...col,
                  id: nanoid(),
                  blocks: col.blocks.map(deepDuplicate)
               }))
            }
         }
         if (b.type === 'table') {
           return {
              ...b,
              id: nanoid(),
              columns: b.columns.map(col => ({...col, id: nanoid()}))
           }
         }
         return { ...b, id: nanoid() } as TemplateBlock
      }

      const duplicate = deepDuplicate(blockToDuplicate)
      addBlock(duplicate as TemplateBlock, id, parentColId)
    },

    selectBlock: (id) => set({ selectedBlockId: id }),

    setSaving: (isSaving) => set({ isSaving }),
    markClean: () => set({ isDirty: false }),
  }))
)
