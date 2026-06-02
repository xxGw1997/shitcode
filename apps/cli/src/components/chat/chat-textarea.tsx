import type { KeyBinding, TextareaRenderable } from "@opentui/core";
import { useRef, useState } from "react";
import { useModeController } from "../../lib/mode-context";
import { modeColors } from "../../lib/mode-colors";
import { ModeBar } from "./mode-bar";

type ChatTextareaProps = {
  onSubmit: (text: string) => void;
};

const minRows = 3;
const maxRows = 6;
const submitKeyBindings: KeyBinding[] = [
  { name: "return", action: "submit" },
  { name: "return", ctrl: true, action: "newline" },
];

export function ChatTextarea({ onSubmit }: ChatTextareaProps) {
  const textareaRef = useRef<TextareaRenderable>(null);
  const { mode } = useModeController();
  const modeColor = modeColors[mode.id] ?? "#facc15";
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
      height={rows + 3}
      border={["left"]}
      borderStyle="heavy"
      borderColor={modeColor}
      backgroundColor="#1E1E1E"
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
