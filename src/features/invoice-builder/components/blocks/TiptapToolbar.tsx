import { useCurrentEditor } from '@tiptap/react'
import { Bold, Italic, AlignLeft, AlignCenter, AlignRight, List, ListOrdered } from 'lucide-react'
import { useTemplateStore } from '../../store/templateStore'

interface Props {
  blockId: string
  showLists?: boolean
}

export function TiptapToolbar({ blockId, showLists = true }: Props) {
  const { editor } = useCurrentEditor()
  const { selectedBlockId } = useTemplateStore()

  if (!editor || selectedBlockId !== blockId) {
    return null
  }

  const insertField = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value
    if (val) {
      editor.chain().focus().insertContent(`{{${val}}}`).run()
      e.target.value = '' // reset
    }
  }

  return (
    <div className="absolute -top-10 left-0 bg-white border border-gray-200 shadow-sm rounded flex items-center p-1 gap-1 z-50">
      <button
        onClick={() => editor.chain().focus().toggleBold().run()}
        className={`p-1 rounded ${editor.isActive('bold') ? 'bg-gray-200' : 'hover:bg-gray-100'}`}
        type="button"
      >
        <Bold className="w-4 h-4" />
      </button>
      <button
        onClick={() => editor.chain().focus().toggleItalic().run()}
        className={`p-1 rounded ${editor.isActive('italic') ? 'bg-gray-200' : 'hover:bg-gray-100'}`}
        type="button"
      >
        <Italic className="w-4 h-4" />
      </button>
      
      <div className="w-px h-4 bg-gray-300 mx-1"></div>

      <button
        onClick={() => editor.chain().focus().setTextAlign('left').run()}
        className={`p-1 rounded ${editor.isActive({ textAlign: 'left' }) ? 'bg-gray-200' : 'hover:bg-gray-100'}`}
        type="button"
      >
        <AlignLeft className="w-4 h-4" />
      </button>
      <button
        onClick={() => editor.chain().focus().setTextAlign('center').run()}
        className={`p-1 rounded ${editor.isActive({ textAlign: 'center' }) ? 'bg-gray-200' : 'hover:bg-gray-100'}`}
        type="button"
      >
        <AlignCenter className="w-4 h-4" />
      </button>
      <button
        onClick={() => editor.chain().focus().setTextAlign('right').run()}
        className={`p-1 rounded ${editor.isActive({ textAlign: 'right' }) ? 'bg-gray-200' : 'hover:bg-gray-100'}`}
        type="button"
      >
        <AlignRight className="w-4 h-4" />
      </button>

      {showLists && (
        <>
          <div className="w-px h-4 bg-gray-300 mx-1"></div>
          <button
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            className={`p-1 rounded ${editor.isActive('bulletList') ? 'bg-gray-200' : 'hover:bg-gray-100'}`}
            type="button"
          >
            <List className="w-4 h-4" />
          </button>
          <button
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            className={`p-1 rounded ${editor.isActive('orderedList') ? 'bg-gray-200' : 'hover:bg-gray-100'}`}
            type="button"
          >
            <ListOrdered className="w-4 h-4" />
          </button>
        </>
      )}

      <div className="w-px h-4 bg-gray-300 mx-1"></div>
      
      <select 
        className="text-xs bg-gray-50 border border-gray-200 rounded px-2 py-1 outline-none cursor-pointer"
        onChange={insertField}
        defaultValue=""
      >
        <option value="" disabled>Insert field ▾</option>
        <option value="invoiceNumber">Invoice Number</option>
        <option value="date">Date</option>
        <option value="dueDate">Due Date</option>
        <option value="from.name">From Name</option>
        <option value="from.address">From Address</option>
        <option value="to.name">To Name</option>
        <option value="to.address">To Address</option>
        <option value="notes">Notes</option>
      </select>
    </div>
  )
}
