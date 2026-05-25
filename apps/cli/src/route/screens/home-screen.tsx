import { useTerminalDimensions } from "@opentui/react";
import { AsciiArtLogo } from "../../components/ascii-art-logo";
import { PromptTextarea } from "../../components/prompt-textarea";

export function HomeScreen() {
  const { width, height } = useTerminalDimensions();
  const panelWidth = Math.min(Math.max(width - 6, 48), 82);
  const contentWidth = Math.max(panelWidth - 4, 1);
  const panelHeight = Math.min(18, Math.max(height - 6, 10));

  return (
    <box width="100%" height="100%" justifyContent="center" alignItems="center">
      <box
        width={panelWidth}
        height={panelHeight}
        border
        borderStyle="rounded"
        borderColor="#7dd3fc"
        backgroundColor="#111827"
        padding={1}
        flexDirection="column"
        gap={1}
      >
        <AsciiArtLogo />
        <text fg="#94a3b8">Capture a prompt here. Route-level structure lives around it.</text>
        <PromptTextarea width={contentWidth} />
      </box>
    </box>
  );
}
