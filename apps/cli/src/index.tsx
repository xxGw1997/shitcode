import { createCliRenderer } from "@opentui/core";
import { createRoot } from "@opentui/react";
import { App } from "@/app";

const renderer = await createCliRenderer({
  exitOnCtrlC: true,
  targetFps: 30,
  backgroundColor: "#0a0a0a",
  useKittyKeyboard: {
    disambiguate: true,
    alternateKeys: true,
  },
});

createRoot(renderer).render(<App />);
