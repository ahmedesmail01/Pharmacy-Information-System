import { useEffect } from "react";
import { EditorProvider } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import TextAlign from "@tiptap/extension-text-align";
import { Color } from "@tiptap/extension-color";
import Placeholder from "@tiptap/extension-placeholder";
import { useTemplateStore } from "../../store/templateStore";
import type { TitleBlock } from "../../types/template.types";
import { TiptapToolbar } from "./TiptapToolbar";
import { TextStyle } from "@tiptap/extension-text-style";

interface Props {
  block: TitleBlock;
}

export function TitleBlockComponent({ block }: Props) {
  const { updateBlock, selectedBlockId } = useTemplateStore();
  const isSelected = selectedBlockId === block.id;

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

  const extensions = [
    StarterKit.configure({
      bulletList: false,
      orderedList: false,
      listItem: false,
    }),
    TextAlign.configure({ types: ["heading", "paragraph"] }),
    TextStyle,
    Color,
    Placeholder.configure({ placeholder: "Document Title..." }),
  ];

  return (
    <div
      className={`relative mb-4 ${alignClass} ${sizeClass} ${weightClass}`}
      style={{ color: block.style.color }}
    >
      <EditorProvider
        key={block.id}
        extensions={extensions}
        content={block.content}
        onUpdate={({ editor }) =>
          updateBlock(block.id, { content: editor.getJSON() })
        }
        editorProps={{
          attributes: {
            class: "outline-none min-h-[1.2em]",
          },
        }}
        slotBefore={<TiptapToolbar blockId={block.id} showLists={false} />}
      ></EditorProvider>
    </div>
  );
}
