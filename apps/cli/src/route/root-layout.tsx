import { Outlet } from "react-router";
import { AppKeyboardShortcuts } from "@/components/app-keyboard-shortcuts";
import { StatusBar } from "@/components/status-bar";
import { CommandProvider } from "@/lib/commands/command-provider";
import { useTheme } from "@/lib/theme";

export function RootLayout() {
  const theme = useTheme();

  return (
    <CommandProvider>
      <AppKeyboardShortcuts />
      <box width="100%" height="100%" flexDirection="column" backgroundColor={theme.colors.background}>
        <box
          flexGrow={1}
          flexShrink={1}
          minHeight={0}
          overflow="hidden"
          backgroundColor={theme.colors.background}
          padding={1}
        >
          <Outlet />
        </box>
        <StatusBar />
      </box>
    </CommandProvider>
  );
}
