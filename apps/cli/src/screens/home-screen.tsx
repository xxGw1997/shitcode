import { measureText, type ASCIIFontName } from "@opentui/core";
import { useTerminalDimensions } from "@opentui/react";
import { useNavigate } from "react-router";
import { AsciiArtLogo } from "../components/ascii-art-logo";
import { ChatTextarea } from "../components/chat/chat-textarea";
import { appRoutes } from "../route/navigation";

const logoFonts: ASCIIFontName[] = ["slick", "grid", "pallet", "tiny"];

export function HomeScreen() {
  const { width } = useTerminalDimensions();
  const navigate = useNavigate();
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
        <box width={inputWidth}>
          <ChatTextarea
            onSubmit={(command) =>
              navigate(appRoutes.chat, { state: { prompt: command } })
            }
          />
        </box>
      </box>
    </box>
  );
}