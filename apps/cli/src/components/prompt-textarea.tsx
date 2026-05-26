import type { ContentChangeEvent, KeyBinding, TextareaRenderable } from "@opentui/core";
import { useRef, useState } from "react";

type PromptTextareaProps = {
  width: number;
  onCommand?: (command: string) => void;
};

const minRows = 2;
const maxRows = 5;
const submitKeyBindings: KeyBinding[] = [
  { name: "return", action: "submit" },
  { name: "kpenter", action: "submit" },
  { name: "linefeed", action: "submit" },
  { name: "return", shift: true, action: "newline" },
  { name: "kpenter", shift: true, action: "newline" },
  { name: "linefeed", shift: true, action: "newline" },
];

export function PromptTextarea({ width, onCommand }: PromptTextareaProps) {
  const textareaRef = useRef<TextareaRenderable>(null);
  const [rows, setRows] = useState(minRows);

  const handleContentChange = (_event: ContentChangeEvent) => {
    const nextRows = Math.min(
      Math.max(textareaRef.current?.virtualLineCount ?? minRows, minRows),
      maxRows,
    );
    setRows(nextRows);
  };

  const handleSubmit = () => {
    const input = textareaRef.current;
    const command = input?.plainText.trim() ?? "";

    if (!command) {
      return;
    }

    onCommand?.(command);
    input?.clear();
    setRows(minRows);
  };

  return (
    <box
      width={width}
      height={rows + 2}
      border
      borderStyle="single"
      borderColor="#64748b"
      backgroundColor="#0a0a0a"
    >
      <textarea
        ref={textareaRef}
        width={Math.max(width - 2, 1)}
        height={rows}
        focused
        wrapMode="word"
        placeholder="Ask shitcode..."
        placeholderColor="#64748b"
        textColor="#e5e7eb"
        backgroundColor="#0a0a0a"
        focusedTextColor="#f8fafc"
        focusedBackgroundColor="#0a0a0a"
        cursorColor="#facc15"
        keyBindings={submitKeyBindings}
        onContentChange={handleContentChange}
        onSubmit={handleSubmit}
      />
    </box>
  );
}
