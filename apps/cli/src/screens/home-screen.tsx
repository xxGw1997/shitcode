import { measureText, TextAttributes, type ASCIIFontName } from "@opentui/core";
import { useTerminalDimensions } from "@opentui/react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { AsciiArtLogo } from "../components/ascii-art-logo";
import { PromptTextarea } from "../components/prompt-textarea";
import { client } from "../lib/client";
import { appRoutes } from "../route/navigation";

const logoFonts: ASCIIFontName[] = ["slick", "grid", "pallet", "tiny"];

export function HomeScreen() {
  const { width } = useTerminalDimensions();
  const navigate = useNavigate();
  const [serverStatus, setServerStatus] = useState("checking server...");
  const inputWidth = Math.min(Math.max(width - 10, 30), 86);
  const logoFont =
    logoFonts.find((font) => measureText({ text: "SHITCODE", font }).width <= width - 4) ??
    "tiny";

  useEffect(() => {
    let ignore = false;

    const checkServer = async () => {
      try {
        const response = await client.health.$get();
        const health = await response.json();

        if (!ignore) {
          setServerStatus(`server ${health.ok ? "ok" : "error"} (${health.runtime}) ${health.timestamp}`);
        }
      } catch {
        if (!ignore) {
          setServerStatus("server unavailable");
        }
      }
    };

    void checkServer();

    return () => {
      ignore = true;
    };
  }, []);

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
        <PromptTextarea width={inputWidth} onCommand={(command) => navigate(appRoutes.chat, { state: { prompt: command } })} />
        <text fg="#94a3b8" attributes={TextAttributes.DIM}>
          {serverStatus}
        </text>
      </box>
    </box>
  );
}
