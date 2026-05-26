import { measureText, type ASCIIFontName } from "@opentui/core";
import { useTerminalDimensions } from "@opentui/react";
import { AsciiArtLogo } from "../../components/ascii-art-logo";
import { PromptTextarea } from "../../components/prompt-textarea";
import { useCommandRunner } from "../command-context";

const logoFonts: ASCIIFontName[] = ["slick", "grid", "pallet", "tiny"];

export function HomeScreen() {
  const { width } = useTerminalDimensions();
  const runCommand = useCommandRunner();
  const inputWidth = Math.min(Math.max(width - 10, 30), 86);
  const logoFont =
    logoFonts.find((font) => measureText({ text: "SHITCODE", font }).width <= width - 4) ??
    "tiny";

  return (
    <box
      width="100%"
      height="100%"
      justifyContent="center"
      alignItems="center"
      backgroundColor="#0a0a0a"
    >
      <box flexDirection="column" alignItems="center" gap={2} backgroundColor="#0a0a0a">
        <AsciiArtLogo font={logoFont} />
        <PromptTextarea width={inputWidth} onCommand={runCommand} />
      </box>
    </box>
  );
}
