import type { KeyBinding, TextareaRenderable } from "@opentui/core";
import { useRef, useState } from "react";

type PromptTextareaProps = {
  width: number;
  onCommand?: (command: string) => void;
};

const minRows = 2;
const maxRows = 5;
const submitKeyBindings: KeyBinding[] = [
  { name: "return", action: "submit" },
  { name: "return", ctrl: true, action: "newline" },
];

export function PromptTextarea({ width, onCommand }: PromptTextareaProps) {
  const textareaRef = useRef<TextareaRenderable>(null);
  const [rows, setRows] = useState(minRows);

  const handleContentChange = () => {
    const text = textareaRef.current?.plainText ?? "";
    const lineCount = text.split("\n").length;
    const nextRows = Math.min(Math.max(lineCount, minRows), maxRows);
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
