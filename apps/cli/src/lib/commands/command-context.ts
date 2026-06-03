import { createContext, useContext } from "react";

type CommandContextValue = {
  runCommand: (command: string) => boolean;
  setSuggestionsVisible: (visible: boolean) => void;
  suggestionsVisible: boolean;
};

export const CommandContext = createContext<CommandContextValue | null>(null);

export function useCommandRunner() {
  const context = useContext(CommandContext);

  if (!context) {
    throw new Error("useCommandRunner must be used inside CommandContext.Provider");
  }

  return context.runCommand;
}

export function useCommandSuggestionVisibility() {
  const context = useContext(CommandContext);

  if (!context) {
    throw new Error("useCommandSuggestionVisibility must be used inside CommandContext.Provider");
  }

  return {
    setSuggestionsVisible: context.setSuggestionsVisible,
    suggestionsVisible: context.suggestionsVisible,
  };
}
