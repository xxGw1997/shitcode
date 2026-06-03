import { useKeyboard } from "@opentui/react";
import { useEffect, useMemo, useState } from "react";
import { useCommandRunner, useCommandSuggestionVisibility } from "./command-context";
import { chatCommands } from "./commands";

type UseCommandSuggestionsOptions = {
  onDismiss?: () => void;
};

export function useCommandSuggestions({ onDismiss }: UseCommandSuggestionsOptions = {}) {
  const runCommand = useCommandRunner();
  const { setSuggestionsVisible } = useCommandSuggestionVisibility();
  const [draftText, setDraftText] = useState("");
  const [dismissedDraftText, setDismissedDraftText] = useState<string | null>(null);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const commandQuery = getCommandQuery(draftText);
  const isVisible = commandQuery !== null && dismissedDraftText !== draftText;
  const commands = useMemo(() => {
    if (commandQuery === null) {
      return [];
    }

    const normalizedQuery = commandQuery.toLowerCase();

    return chatCommands.filter((command) => {
      if (command.name.startsWith(normalizedQuery)) {
        return true;
      }

      return command.aliases.some((alias) => alias.startsWith(normalizedQuery));
    });
  }, [commandQuery]);

  useEffect(() => {
    setSelectedIndex(0);
  }, [commandQuery]);

  useEffect(() => {
    setSuggestionsVisible(isVisible);

    return () => setSuggestionsVisible(false);
  }, [isVisible, setSuggestionsVisible]);

  useEffect(() => {
    if (selectedIndex >= commands.length) {
      setSelectedIndex(Math.max(commands.length - 1, 0));
    }
  }, [selectedIndex, commands.length]);

  useKeyboard((event) => {
    if (commandQuery !== null && event.name === "escape") {
      setDismissedDraftText(null);
      setDraftText("");
      onDismiss?.();
      return;
    }

    if (event.eventType !== "press" && event.eventType !== "repeat") {
      return;
    }

    if (!isVisible || commands.length === 0) {
      return;
    }

    if (event.name === "up") {
      setSelectedIndex((index) => (index === 0 ? commands.length - 1 : index - 1));
    }

    if (event.name === "down") {
      setSelectedIndex((index) => (index + 1) % commands.length);
    }
  });

  const runInputCommand = (text: string) => {
    const selectedCommand = isVisible ? commands[selectedIndex] : undefined;
    const commandText = selectedCommand ? `/${selectedCommand.name}` : text;

    return runCommand(commandText);
  };

  return {
    commands,
    isVisible,
    reset: () => {
      setDismissedDraftText(null);
      setDraftText("");
    },
    runInputCommand,
    selectedIndex,
    setSelectedIndex,
    setDraftText,
  };
}

function getCommandQuery(text: string) {
  if (!text.startsWith("/") || /\s/.test(text)) {
    return null;
  }

  return text.slice(1).toLowerCase();
}
