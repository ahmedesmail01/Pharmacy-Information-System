import { useMemo } from "react";
import { generateHTML } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import TextAlign from "@tiptap/extension-text-align";
import { Color } from "@tiptap/extension-color";
import type { TextBlock, InvoiceData } from "../../types/template.types";
import { interpolateContent } from "../../utils/interpolate";
import { TextStyle } from "@tiptap/extension-text-style";

interface Props {
  block: TextBlock;
  data: InvoiceData;
}

export function RenderedText({ block, data }: Props) {
  const html = useMemo(() => {
    const interpolated = interpolateContent(block.content, data);
    return generateHTML(interpolated, [
      StarterKit,
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      TextStyle,
      Color,
    ]);
  }, [block.content, data]);

  return (
    <div
      className="prose prose-sm max-w-none text-gray-700"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
