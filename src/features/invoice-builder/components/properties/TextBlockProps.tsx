import type { TextBlock } from "../../types/template.types";

interface Props {
  block: TextBlock;
  onChange: (updates: Partial<TextBlock>) => void;
}

export function TextBlockProps({ block }: Props) {
  return (
    <div className="text-sm text-gray-500 italic">
      Format text using the toolbar above the block in the canvas.
    </div>
  );
}
