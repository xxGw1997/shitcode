import { createContext, useContext } from "react";

type CommandContextValue = {
  runCommand: (command: string) => void;
};

export const CommandContext = createContext<CommandContextValue | null>(null);

export function useCommandRunner() {
  const context = useContext(CommandContext);

  if (!context) {
    throw new Error("useCommandRunner must be used inside CommandContext.Provider");
  }

  return context.runCommand;
}
