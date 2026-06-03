import type { KeyBinding, TextareaRenderable } from "@opentui/core";
import { useRef, useState } from "react";
import { useCommandSuggestions } from "@/lib/commands/use-command-suggestions";
import { modeColors } from "@/lib/mode/mode-colors";
import { useModeController } from "@/lib/mode/mode-context";
import { CommandSuggestions } from "./command-suggestions";
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
  const commandSuggestions = useCommandSuggestions({
    onDismiss: () => {
      textareaRef.current?.clear();
      setRows(minRows);
    },
  });

  const handleContentChange = () => {
    const text = textareaRef.current?.plainText ?? "";
    const lineCount = text.split("\n").length;
    const nextRows = Math.min(Math.max(lineCount, minRows), maxRows);
    commandSuggestions.setDraftText(text);
    setRows(nextRows);
  };

  const handleSubmit = () => {
    const input = textareaRef.current;
    const text = input?.plainText.trim() ?? "";

    if (!text) {
      return;
    }

    if (!commandSuggestions.runInputCommand(text)) {
      onSubmit(text);
    }

    input?.clear();
    commandSuggestions.reset();
    setRows(minRows);
  };

  return (
    <box position="relative" flexDirection="column" overflow="visible">
      {commandSuggestions.isVisible && (
        <box
          position="absolute"
          left={0}
          right={0}
          bottom={rows + 3}
          zIndex={100}
        >
          <CommandSuggestions
            commands={commandSuggestions.commands}
            onHighlight={commandSuggestions.setSelectedIndex}
            selectedIndex={commandSuggestions.selectedIndex}
          />
        </box>
      )}
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
    </box>
  );
}
