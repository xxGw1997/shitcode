import { useRenderer } from "@opentui/react";
import { useState, type ReactNode } from "react";
import { useNavigate } from "react-router";
import { useSessionsDialog } from "@/components/sessions/sessions-dialog";
import { CommandContext } from "./command-context";
import { runChatCommand } from "./commands";

type CommandProviderProps = {
  children: ReactNode;
};

export function CommandProvider({ children }: CommandProviderProps) {
  const renderer = useRenderer();
  const navigate = useNavigate();
  const openSessionsDialog = useSessionsDialog();
  const [suggestionsVisible, setSuggestionsVisible] = useState(false);

  const runCommand = (command: string) => {
    return runChatCommand(command, {
      navigate,
      exit: () => renderer.destroy(),
      openSessionsDialog,
    });
  };

  return (
    <CommandContext.Provider
      value={{ runCommand, setSuggestionsVisible, suggestionsVisible }}
    >
      {children}
    </CommandContext.Provider>
  );
}
