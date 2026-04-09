import { useMemo } from "react";
import { generateHTML } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import TextAlign from "@tiptap/extension-text-align";
import { Color } from "@tiptap/extension-color";
import type { TitleBlock, InvoiceData } from "../../types/template.types";
import { interpolateContent } from "../../utils/interpolate";
import { TextStyle } from "@tiptap/extension-text-style";

interface Props {
  block: TitleBlock;
  data: InvoiceData;
}

export function RenderedTitle({ block, data }: Props) {
  const html = useMemo(() => {
    const interpolated = interpolateContent(block.content, data);
    return generateHTML(interpolated, [
      StarterKit,
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      TextStyle,
      Color,
    ]);
  }, [block.content, data]);

  const alignClass =
    block.style.textAlign === "center"
      ? "text-center"
      : block.style.textAlign === "right"
        ? "text-right"
        : "text-left";

  const sizeClass = {
    sm: "text-sm",
    base: "text-base",
    lg: "text-lg",
    xl: "text-xl",
    "2xl": "text-2xl",
    "3xl": "text-3xl",
  }[block.style.fontSize || "3xl"];

  const weightClass = {
    normal: "font-normal",
    medium: "font-medium",
    semibold: "font-semibold",
    bold: "font-bold",
  }[block.style.fontWeight || "bold"];

  return (
    <div
      className={`${alignClass} ${sizeClass} ${weightClass} mb-4`}
      style={{ color: block.style.color }}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
