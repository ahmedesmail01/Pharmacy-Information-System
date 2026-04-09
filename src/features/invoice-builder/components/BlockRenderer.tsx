// We wrap the renderer versions so we have standard components for divider, spacer, header-meta.
// The builder side properties panel will handle editing their properties.

import { RenderedDivider } from "../renderer/blocks/RenderedDivider";
import { RenderedHeaderMeta } from "../renderer/blocks/RenderedHeaderMeta";
import { RenderedSpacer } from "../renderer/blocks/RenderedSpacer";
import { TemplateBlock } from "../types/template.types";
import { ColumnsBlockComponent } from "./blocks/ColumnsBlock";
import { TableColumnsBlockComponent } from "./blocks/TableColumnsBlock";
import { TextBlockComponent } from "./blocks/TextBlock";
import { TitleBlockComponent } from "./blocks/TitleBlock";

export function BlockRenderer({ block }: { block: TemplateBlock }) {
  switch (block.type) {
    case "title":
      return <TitleBlockComponent block={block} />;
    case "text":
      return <TextBlockComponent block={block} />;
    case "columns":
      return <ColumnsBlockComponent block={block} />;
    case "table":
      return <TableColumnsBlockComponent block={block} />;
    case "divider":
      return <RenderedDivider block={block} />;
    case "spacer":
      return <RenderedSpacer block={block} />;
    case "header-meta":
      return <RenderedHeaderMeta block={block} data={{}} meta={{}} />;
    default:
      return null;
  }
}
