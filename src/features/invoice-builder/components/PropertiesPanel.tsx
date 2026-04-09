import { useTemplateStore } from "../store/templateStore";
import { ColumnsBlockProps } from "./properties/ColumnsBlockProps";
import { DividerBlockProps } from "./properties/DividerBlockProps";
import { HeaderMetaBlockProps } from "./properties/HeaderMetaBlockProps";
import { SpacerBlockProps } from "./properties/SpacerBlockProps";
import { TableColumnsBlockProps } from "./properties/TableColumnsBlockProps";
import { TemplateMetaProps } from "./properties/TemplateMetaProps";
import { TextBlockProps } from "./properties/TextBlockProps";
import { TitleBlockProps } from "./properties/TitleBlockProps";

export function PropertiesPanel() {
  const { template, selectedBlockId, updateBlock } = useTemplateStore();

  let selectedBlock = null;
  if (selectedBlockId) {
    // DFS to find the block
    const findBlock = (blocks: any[]) => {
      for (const b of blocks) {
        if (b.id === selectedBlockId) return b;
        if (b.type === "columns") {
          for (const col of b.columns) {
            const found: any = findBlock(col.blocks);
            if (found) return found;
          }
        }
      }
      return null;
    };
    selectedBlock = findBlock(template.blocks);
  }

  return (
    <div className="w-72 bg-white border-l border-gray-200 flex-shrink-0 overflow-y-auto">
      <div className="p-4 border-b border-gray-200 bg-gray-50 sticky top-0 z-10">
        <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wider">
          {selectedBlock ? `Edit ${selectedBlock.type}` : "Template Settings"}
        </h2>
      </div>

      <div className="p-4">
        {!selectedBlock ? (
          <TemplateMetaProps />
        ) : (
          <div className="flex flex-col gap-4">
            {selectedBlock.type === "title" && (
              <TitleBlockProps
                block={selectedBlock}
                onChange={(updates) => updateBlock(selectedBlock.id, updates)}
              />
            )}
            {selectedBlock.type === "text" && (
              <TextBlockProps
                block={selectedBlock}
                onChange={(updates) => updateBlock(selectedBlock.id, updates)}
              />
            )}
            {selectedBlock.type === "columns" && (
              <ColumnsBlockProps
                block={selectedBlock}
                onChange={(updates) => updateBlock(selectedBlock.id, updates)}
              />
            )}
            {selectedBlock.type === "table" && (
              <TableColumnsBlockProps
                block={selectedBlock}
                onChange={(updates) => updateBlock(selectedBlock.id, updates)}
              />
            )}
            {selectedBlock.type === "spacer" && (
              <SpacerBlockProps
                block={selectedBlock}
                onChange={(updates) => updateBlock(selectedBlock.id, updates)}
              />
            )}
            {selectedBlock.type === "divider" && (
              <DividerBlockProps
                block={selectedBlock}
                onChange={(updates) => updateBlock(selectedBlock.id, updates)}
              />
            )}
            {selectedBlock.type === "header-meta" && (
              <HeaderMetaBlockProps
                block={selectedBlock}
                onChange={(updates) => updateBlock(selectedBlock.id, updates)}
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
}
