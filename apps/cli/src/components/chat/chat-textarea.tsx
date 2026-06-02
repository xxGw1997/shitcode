import type { KeyBinding, TextareaRenderable } from "@opentui/core";
import { useRef, useState } from "react";
import { ModeBar } from "./mode-bar";

type ChatTextareaProps = {
  onSubmit: (text: string) => void;
};

const minRows = 2;
const maxRows = 6;
const submitKeyBindings: KeyBinding[] = [
  { name: "return", action: "submit" },
  { name: "return", ctrl: true, action: "newline" },
];

export function ChatTextarea({ onSubmit }: ChatTextareaProps) {
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
    const text = input?.plainText.trim() ?? "";

    if (!text) {
      return;
    }

    onSubmit(text);
    input?.clear();
    setRows(minRows);
  };

  return (
    <box
      height={rows + 5}
      border
      borderStyle="rounded"
      borderColor="#334155"
      padding={1}
    >
      <textarea
        ref={textareaRef}
        height={rows}
        focused
        wrapMode="word"
        placeholder="Ask shitcode..."
        placeholderColor="#475569"
        cursorColor="#facc15"
        keyBindings={submitKeyBindings}
        onContentChange={handleContentChange}
        onSubmit={handleSubmit}
      />
      <ModeBar />
    </box>
  );
}