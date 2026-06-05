import { createCliRenderer } from "@opentui/core";
import { createRoot } from "@opentui/react";
import { App } from "@/app";
import { getTheme } from "@/lib/theme";

const theme = getTheme();

const renderer = await createCliRenderer({
  exitOnCtrlC: true,
  targetFps: 30,
  backgroundColor: theme.colors.background,
  useKittyKeyboard: {
    disambiguate: true,
    alternateKeys: true,
  },
});

createRoot(renderer).render(<App />);
