import { useDraggable } from '@dnd-kit/core'
import { Type, Heading, Columns, Table, Minus, ArrowUpDown, LayoutPanelTop } from 'lucide-react'
import { useTemplateStore } from '../store/templateStore'
import { createBlock } from '../utils/blockDefaults'
import type { BlockType } from '../types/template.types'

const BLOCK_TYPES: { type: BlockType; label: string; icon: React.ReactNode; args?: any }[] = [
  { type: 'header-meta', label: 'Header Meta', icon: <LayoutPanelTop className="w-4 h-4" /> },
  { type: 'title', label: 'Title', icon: <Heading className="w-4 h-4" /> },
  { type: 'text', label: 'Text', icon: <Type className="w-4 h-4" /> },
  { type: 'columns', label: 'Two Columns', icon: <Columns className="w-4 h-4" /> },
  { type: 'table', label: 'Line Items', icon: <Table className="w-4 h-4" /> },
  { type: 'divider', label: 'Divider', icon: <Minus className="w-4 h-4" /> },
  { type: 'spacer', label: 'Spacer', icon: <ArrowUpDown className="w-4 h-4" /> },
]

export function BlockSidebar() {
  const { addBlock } = useTemplateStore()

  const handleAddClick = (type: BlockType) => {
    const block = createBlock(type)
    addBlock(block)
  }

  return (
    <div className="w-56 bg-white border-r border-gray-200 flex-shrink-0 overflow-y-auto p-4">
      <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4">Add Block</h3>
      <div className="flex flex-col gap-2">
        {BLOCK_TYPES.map((bt) => (
          <DraggableBlockType 
            key={bt.label} 
            type={bt.type} 
            label={bt.label} 
            icon={bt.icon} 
            onClick={() => handleAddClick(bt.type)} 
          />
        ))}
      </div>
    </div>
  )
}

function DraggableBlockType({ type, label, icon, onClick }: { type: BlockType, label: string, icon: React.ReactNode, onClick: () => void }) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `add-${type}`,
    data: {
      type: 'BlockType',
      blockType: type,
    }
  })

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      className={`flex items-center gap-2 p-2 rounded border border-gray-200 bg-white cursor-grab hover:border-blue-300 hover:bg-blue-50 transition-colors ${
        isDragging ? 'opacity-50' : ''
      }`}
      onClick={onClick}
    >
      <div className="text-gray-500">{icon}</div>
      <span className="text-sm font-medium text-gray-700">{label}</span>
    </div>
  )
}
