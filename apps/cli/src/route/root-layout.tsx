import { Outlet } from "react-router";
import { AppKeyboardShortcuts } from "@/components/app-keyboard-shortcuts";
import { StatusBar } from "@/components/status-bar";
import { CommandProvider } from "@/lib/commands/command-provider";

export function RootLayout() {
  return (
    <CommandProvider>
      <AppKeyboardShortcuts />
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
        <StatusBar />
      </box>
    </CommandProvider>
  );
}
