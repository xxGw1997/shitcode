import { type KeyEvent } from "@opentui/core";
import { useKeyboard, useRenderer } from "@opentui/react";
import { useDialog } from "@/components/dialog";
import { useCommandSuggestionVisibility } from "@/lib/commands/command-context";
import { useModeController } from "@/lib/mode/mode-context";

export function AppKeyboardShortcuts() {
  const renderer = useRenderer();
  const { dialog } = useDialog();
  const { suggestionsVisible } = useCommandSuggestionVisibility();
  const { next } = useModeController();

  useKeyboard((event: KeyEvent) => {
    if (event.eventType !== "press" || event.repeated) {
      return;
    }

    if (event.name === "escape") {
      if (dialog || suggestionsVisible) {
        return;
      }

      renderer.destroy();
      return;
    }

    if (event.name === "tab") {
      next();
    }
  });

  return null;
}
