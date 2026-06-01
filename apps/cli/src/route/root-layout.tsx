import { TextAttributes, type KeyEvent } from "@opentui/core";
import { Outlet, useNavigate } from "react-router";
import { useKeyboard, useRenderer, useTerminalDimensions } from "@opentui/react";
import { appRoutes } from "./navigation";
import { CommandContext } from "./command-context";
import { useModeController } from "../lib/mode-context";

const cliVersion = Bun.env.npm_package_version ?? "0.1.0";
const statusVersion = `v${cliVersion}`;

export function RootLayout() {
  const renderer = useRenderer();
  const navigate = useNavigate();
  const { width } = useTerminalDimensions();
  const cwd = Bun.env.INIT_CWD ?? process.cwd();
  const cwdWidth = Math.max(width - statusVersion.length - 4, 1);
  const { next } = useModeController();

  const runCommand = (command: string) => {
    if (command === appRoutes.home || command === "/") {
      navigate(appRoutes.home);
    }
  };

  useKeyboard((event: KeyEvent) => {
    if (event.eventType !== "press" || event.repeated) {
      return;
    }

    if (event.name === "escape") {
      renderer.destroy();
      return;
    }

    if (event.name === "tab") {
      next();
    }
  });

  return (
    <CommandContext.Provider value={{ runCommand }}>
      <box width="100%" height="100%" flexDirection="column" backgroundColor="#0a0a0a">
        <box
          flexGrow={1}
          flexShrink={1}
          minHeight={0}
          overflow="hidden"
          backgroundColor="#0a0a0a"
          padding={1}
        >
          <Outlet />
        </box>

        <box
          flexDirection="row"
          justifyContent="space-between"
          flexShrink={0}
          paddingLeft={1}
          paddingRight={1}
          backgroundColor="#0a0a0a"
        >
          <text width={cwdWidth} truncate fg="#94a3b8" attributes={TextAttributes.DIM}>
            {cwd}
          </text>
          <text fg="#94a3b8" attributes={TextAttributes.DIM}>
            {statusVersion}
          </text>
        </box>
      </box>
    </CommandContext.Provider>
  );
}
