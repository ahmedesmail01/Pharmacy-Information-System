import { EditorProvider } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import TextAlign from "@tiptap/extension-text-align";
import { Color } from "@tiptap/extension-color";
import Placeholder from "@tiptap/extension-placeholder";
import { useTemplateStore } from "../../store/templateStore";
import type { TextBlock } from "../../types/template.types";
import { TiptapToolbar } from "./TiptapToolbar";
import { TextStyle } from "@tiptap/extension-text-style";

interface Props {
  block: TextBlock;
}

export function TextBlockComponent({ block }: Props) {
  const { updateBlock } = useTemplateStore();

  const extensions = [
    StarterKit,
    TextAlign.configure({ types: ["heading", "paragraph"] }),
    TextStyle,
    Color,
    Placeholder.configure({ placeholder: "Type / to add content..." }),
  ];

  return (
    <div className="relative prose prose-sm max-w-none text-gray-700">
      <EditorProvider
        key={block.id}
        extensions={extensions}
        content={block.content}
        onUpdate={({ editor }) =>
          updateBlock(block.id, { content: editor.getJSON() })
        }
        editorProps={{
          attributes: {
            class: "outline-none min-h-[3em]",
          },
        }}
        slotBefore={<TiptapToolbar blockId={block.id} showLists={true} />}
      ></EditorProvider>
    </div>
  );
}
