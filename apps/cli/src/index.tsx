import { createCliRenderer } from "@opentui/core";
import { createRoot, useKeyboard, useRenderer, useTerminalDimensions } from "@opentui/react";
import { createGreeting } from "@shitcode/shared";

function App() {
  const renderer = useRenderer();
  const { width, height } = useTerminalDimensions();
  const panelWidth = Math.min(Math.max(width - 4, 48), 82);
  const panelHeight = 14;

  useKeyboard((key) => {
    if (key.name === "q" || key.name === "escape") {
      renderer.destroy();
    }
  });

  return (
    <box width="100%" height="100%" justifyContent="center" alignItems="center">
      <box
        width={panelWidth}
        height={Math.min(panelHeight, Math.max(height - 2, 8))}
        border
        borderStyle="rounded"
        borderColor="#7dd3fc"
        backgroundColor="#111827"
        padding={1}
        flexDirection="column"
        gap={1}
      >
        <ascii-font text="WELCOME" font="tiny" color="#facc15" />
        <text fg="#e5e7eb">
          <strong>Bun workspace</strong>
          <span fg="#9ca3af"> + Hono server + OpenTUI React CLI</span>
        </text>
        <text fg="#d1d5db" width={panelWidth - 4}>
          {createGreeting("@shitcode/cli")}. This screen is rendered with React on top of OpenTUI.
        </text>
        <text fg="#93c5fd">
          <span fg="#93c5fd">Press q or Esc to quit. Ctrl+C also works.</span>
        </text>
      </box>
    </box>
  );
}

const renderer = await createCliRenderer({
  exitOnCtrlC: true,
  targetFps: 30,
});

createRoot(renderer).render(<App />);
