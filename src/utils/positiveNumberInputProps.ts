export const positiveNumberInputProps = {
  min: 0,
  inputMode: "decimal" as const,
  onKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (["-", "e", "E"].includes(e.key)) e.preventDefault();
  },
  onPaste: (e: React.ClipboardEvent<HTMLInputElement>) => {
    const text = e.clipboardData.getData("text");
    // block negative paste
    if (text.includes("-")) e.preventDefault();
  },
};
