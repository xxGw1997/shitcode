import { TextAttributes, type KeyEvent } from "@opentui/core";
import { Outlet, useLocation, useNavigate } from "react-router";
import { useKeyboard, useRenderer } from "@opentui/react";
import { appRoutes, navigationItems } from "./navigation";

export function RootLayout() {
  const renderer = useRenderer();
  const navigate = useNavigate();
  const location = useLocation();
  const currentScreen =
    navigationItems.find((item) => item.path === location.pathname)?.label ?? "Unknown";

  useKeyboard((event: KeyEvent) => {
    if (event.eventType !== "press" || event.repeated) {
      return;
    }

    if (event.name === "escape") {
      renderer.destroy();
      return;
    }

    if (event.name === "f1") {
      navigate(appRoutes.home);
      return;
    }

    if (event.name === "f2") {
      navigate(appRoutes.help);
    }
  });

  return (
    <box width="100%" height="100%" flexDirection="column">
      <box
        flexDirection="row"
        justifyContent="space-between"
        paddingLeft={1}
        paddingRight={1}
        paddingTop={1}
        paddingBottom={1}
        border={["bottom"]}
        borderStyle="single"
        borderColor="#334155"
      >
        <text attributes={TextAttributes.BOLD} fg="#f8fafc">
          SHITCODE CLI
        </text>
        <text attributes={TextAttributes.DIM} fg="#94a3b8">
          Screen: {currentScreen}
        </text>
      </box>

      <box flexGrow={1} padding={1}>
        <Outlet />
      </box>

      <box
        flexDirection="row"
        justifyContent="center"
        gap={3}
        paddingTop={1}
        paddingBottom={1}
        border={["top"]}
        borderStyle="single"
        borderColor="#334155"
      >
        {navigationItems.map((item) => {
          const isActive = item.path === location.pathname;

          return (
            <text
              key={item.path}
              fg={isActive ? "#facc15" : "#cbd5e1"}
              attributes={
                isActive
                  ? TextAttributes.BOLD | TextAttributes.UNDERLINE
                  : TextAttributes.NONE
              }
            >
              [{item.shortcut}] {item.label}
            </text>
          );
        })}
        <text fg="#94a3b8" attributes={TextAttributes.DIM}>
          [Esc] Quit
        </text>
      </box>
    </box>
  );
}
