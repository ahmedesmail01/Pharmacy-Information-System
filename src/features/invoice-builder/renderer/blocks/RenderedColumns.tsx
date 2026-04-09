import type {
  ColumnsBlock,
  InvoiceData,
  TemplateMeta,
} from "../../types/template.types";

// We need to lazily import or pass down the block renderer because Columns render nested blocks
// To avoid circular dependency, we'll accept a renderBlock function as a prop

interface Props {
  block: ColumnsBlock;
  data: InvoiceData;
  meta: TemplateMeta;
  renderBlock: (block: any) => React.ReactNode;
}

export function RenderedColumns({ block, data, meta, renderBlock }: Props) {
  return (
    <div
      className="flex flex-row  w-full"
      style={{ gap: `${block.gap ?? 24}px` }}
    >
      {block.columns.map((col) => (
        <div
          key={col.id}
          className="flex flex-col min-w-0"
          style={{ flexGrow: col.width, flexBasis: 0 }}
        >
          {col.blocks.map((b) => (
            <div key={b.id}>{renderBlock(b)}</div>
          ))}
        </div>
      ))}
    </div>
  );
}
