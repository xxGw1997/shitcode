import { TextAttributes } from "@opentui/core";
import { useTerminalDimensions } from "@opentui/react";
import { PromptTextarea } from "../../components/prompt-textarea";
import { useCommandRunner } from "../command-context";

export function SettingsScreen() {
  const { width } = useTerminalDimensions();
  const runCommand = useCommandRunner();
  const inputWidth = Math.min(Math.max(width - 10, 30), 86);

  return (
    <box
      width="100%"
      height="100%"
      justifyContent="center"
      alignItems="center"
      backgroundColor="#0a0a0a"
    >
      <box flexDirection="column" alignItems="center" gap={2} backgroundColor="#0a0a0a">
        <text fg="#f8fafc" attributes={TextAttributes.BOLD}>
          Settings
        </text>
        <PromptTextarea width={inputWidth} onCommand={runCommand} />
      </box>
    </box>
  );
}
