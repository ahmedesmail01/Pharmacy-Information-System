import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { GripVertical, Copy, Trash2, ArrowUp, ArrowDown } from 'lucide-react'
import { useTemplateStore } from '../store/templateStore'
import type { TemplateBlock } from '../types/template.types'

interface Props {
  block: TemplateBlock
  children: React.ReactNode
  parentColumnId?: string // if inside a column
}

export function BlockWrapper({ block, children, parentColumnId }: Props) {
  const { id } = block
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id })

  const {
    selectedBlockId,
    selectBlock,
    removeBlock,
    duplicateBlock,
    template,
    reorderBlocks,
  } = useTemplateStore()

  const isSelected = selectedBlockId === id

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  const handleSelect = (e: React.MouseEvent) => {
    e.stopPropagation()
    selectBlock(id)
  }

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation()
    removeBlock(id)
  }

  const handleDuplicate = (e: React.MouseEvent) => {
    e.stopPropagation()
    duplicateBlock(id)
  }

  const moveBlock = (e: React.MouseEvent, direction: -1 | 1) => {
    e.stopPropagation()
    // Simple up/down logic within the current list
    let list: TemplateBlock[] = []
    
    if (parentColumnId) {
      // Find the columns block
      for (const topBlock of template.blocks) {
        if (topBlock.type === 'columns') {
          const col = topBlock.columns.find(c => c.id === parentColumnId)
          if (col) {
            list = col.blocks
            break
          }
        }
      }
    } else {
      list = template.blocks
    }

    const currentIndex = list.findIndex(b => b.id === id)
    if (currentIndex === -1) return
    const newIndex = currentIndex + direction
    if (newIndex < 0 || newIndex >= list.length) return

    const newOrder = [...list]
    const temp = newOrder[currentIndex]
    newOrder[currentIndex] = newOrder[newIndex]
    newOrder[newIndex] = temp

    reorderBlocks(newOrder.map(b => b.id), parentColumnId)
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`group relative mb-2 min-h-[40px] px-8 py-2 rounded transition-all cursor-pointer ${
        isSelected ? 'ring-2 ring-blue-500 ring-offset-1 z-10' : 'hover:ring-1 hover:ring-blue-300'
      }`}
      onClick={handleSelect}
    >
      {/* Drag handle */}
      <div
        className={`absolute left-0 top-1/2 -translate-y-1/2 p-2 cursor-grab opacity-0 group-hover:opacity-100 transition-opacity ${
          isSelected ? 'opacity-100' : ''
        }`}
        {...attributes}
        {...listeners}
      >
        <GripVertical className="h-5 w-5 text-gray-400 hover:text-gray-600" />
      </div>

      {/* Content */}
      <div className="w-full relative pointer-events-none">
        {/* Child elements like Tiptap need pointer events */}
        <div className="pointer-events-auto">
           {children}
        </div>
      </div>

      {/* Action buttons on top right when selected or hovered */}
      {(isSelected || true /* Or just show on hover via CSS */) && (
        <div className="absolute top-0 right-0 -mt-3 mr-2 hidden group-hover:flex items-center gap-1 bg-white shadow py-1 px-2 rounded border border-gray-200 z-20">
          <button onClick={(e) => moveBlock(e, -1)} className="p-1 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded" title="Move Up">
            <ArrowUp className="w-4 h-4" />
          </button>
          <button onClick={(e) => moveBlock(e, 1)} className="p-1 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded" title="Move Down">
            <ArrowDown className="w-4 h-4" />
          </button>
          <button onClick={handleDuplicate} className="p-1 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded" title="Duplicate">
            <Copy className="w-4 h-4" />
          </button>
          <button onClick={handleDelete} className="p-1 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded" title="Delete">
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  )
}
