import { useDroppable } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { useTemplateStore } from '../store/templateStore'
import { BlockWrapper } from './BlockWrapper'
import { BlockRenderer } from './BlockRenderer'

export function BuilderCanvas() {
  const { template, selectBlock } = useTemplateStore()
  
  const { setNodeRef, isOver } = useDroppable({
    id: 'canvas-root',
    data: {
      type: 'RootCanvas'
    }
  })

  return (
    <div 
      className="flex-1 overflow-auto bg-gray-100"
      onClick={() => selectBlock(null)}
    >
      <div className="w-full min-w-max p-4 lg:p-8 flex justify-center min-h-full">
        <div 
          ref={setNodeRef}
          className={`bg-white shadow-lg relative transition-colors min-h-[500px] flex-shrink-0 ${isOver ? 'ring-2 ring-blue-400 ring-offset-2' : ''}`}
          style={{
            width: template.meta.paperSize === 'Letter' ? '816px' : '794px',
            minHeight: template.meta.paperSize === 'Letter' ? '1056px' : '1123px',
            paddingTop: `${template.meta.margins?.top || 40}px`,
            paddingRight: `${template.meta.margins?.right || 40}px`,
            paddingBottom: `${template.meta.margins?.bottom || 40}px`,
            paddingLeft: `${template.meta.margins?.left || 40}px`,
            fontFamily: template.meta.fontFamily || 'Inter, sans-serif'
          }}
        >
          <SortableContext items={template.blocks.map(b => b.id)} strategy={verticalListSortingStrategy}>
            {template.blocks.map(block => (
              <BlockWrapper key={block.id} block={block}>
                <BlockRenderer block={block} />
              </BlockWrapper>
            ))}
          </SortableContext>
          
          {template.blocks.length === 0 && (
            <div className="flex flex-col items-center justify-center h-64 text-gray-400 border border-dashed border-gray-300 rounded m-8">
              <p className="mb-2">This template is empty</p>
              <p className="text-sm">Drag or click blocks from the sidebar to start</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
