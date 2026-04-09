import { useDroppable } from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import type { ColumnsBlock, TemplateBlock } from "../../types/template.types";
import { BlockWrapper } from "../BlockWrapper";
import { BlockRenderer } from "../BlockRenderer";

interface Props {
  block: ColumnsBlock;
}

export function ColumnsBlockComponent({ block }: Props) {
  return (
    <div
      className="flex flex-row  w-full"
      style={{ gap: `${block.gap ?? 24}px` }}
    >
      {block.columns.map((col) => (
        <ColumnDroppable
          key={col.id}
          col={col}
          columnId={col.id}
          parentBlockId={block.id}
        />
      ))}
    </div>
  );
}

function ColumnDroppable({
  col,
  columnId,
  parentBlockId,
}: {
  col: any;
  columnId: string;
  parentBlockId: string;
}) {
  const { setNodeRef, isOver } = useDroppable({
    id: columnId,
    data: {
      type: "Column",
      columnId,
      parentBlockId,
    },
  });

  return (
    <div
      className="flex flex-col relative group/column min-w-0"
      style={{ flexGrow: col.width, flexBasis: 0 }}
    >
      <div className="text-xs text-gray-400 font-medium mb-1 uppercase tracking-wider">
        {col.label}
      </div>
      <div
        ref={setNodeRef}
        className={`min-h-[100px] border-2 border-dashed rounded p-2 transition-colors ${
          isOver
            ? "border-blue-400 bg-blue-50/50"
            : "border-transparent group-hover/column:border-gray-200"
        }`}
      >
        <SortableContext
          items={col.blocks.map((b: TemplateBlock) => b.id)}
          strategy={verticalListSortingStrategy}
        >
          {col.blocks.map((childBlock: TemplateBlock) => (
            <BlockWrapper
              key={childBlock.id}
              block={childBlock}
              parentColumnId={columnId}
            >
              <BlockRenderer block={childBlock} />
            </BlockWrapper>
          ))}
        </SortableContext>

        {col.blocks.length === 0 && (
          <div className="h-full flex items-center justify-center text-gray-300 text-sm italic">
            Drag blocks here
          </div>
        )}
      </div>
    </div>
  );
}
