import { measureText, type ASCIIFontName } from "@opentui/core";
import { useTerminalDimensions } from "@opentui/react";
import { useNavigate } from "react-router";
import { AsciiArtLogo } from "@/components/ascii-art-logo";
import { ChatTextarea } from "@/components/chat/chat-textarea";
import { client } from "@/lib/api/client";
import { createUserMessageMetadata } from "@/lib/messages/message-metadata";
import { useModeController } from "@/lib/mode/mode-context";
import { useTheme } from "@/lib/theme";
import { appRoutes } from "@/route/navigation";

const logoFonts: ASCIIFontName[] = ["slick", "grid", "pallet", "tiny"];

export function HomeScreen() {
  const { width } = useTerminalDimensions();
  const navigate = useNavigate();
  const { mode } = useModeController();
  const theme = useTheme();
  const inputWidth = Math.min(Math.max(width - 10, 30), 86);
  const logoFont =
    logoFonts.find((font) => measureText({ text: "SHITCODE", font }).width <= width - 4) ??
    "tiny";

  const handleSubmit = async (prompt: string) => {
    const res = await client.chat.sessions.$post({
      json: { title: prompt.slice(0, 80) },
    });
    if (!res.ok) return;
    const session = await res.json();
    navigate(appRoutes.chat(session.id), {
      state: { prompt, promptMetadata: createUserMessageMetadata(mode) },
    });
  };

  return (
    <box
      width="100%"
      height="100%"
      justifyContent="center"
      alignItems="center"
      backgroundColor={theme.colors.background}
    >
      <box flexDirection="column" alignItems="center" gap={2} backgroundColor={theme.colors.background}>
        <AsciiArtLogo font={logoFont} />
        <box width={inputWidth}>
          <ChatTextarea onSubmit={handleSubmit} />
        </box>
      </box>
    </box>
  );
}
