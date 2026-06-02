import { useModeController } from "../../lib/mode-context";

const modeColors: Record<string, string> = {
  build: "#facc15",
  plan: "#9d7cd8",
};

export function ModeBar() {
  const { mode } = useModeController();
  const color = modeColors[mode.id] ?? "#facc15";

  return (
    <box
      flexDirection="row"
      alignItems="center"
      flexShrink={0}
      marginTop={1}
      paddingLeft={1}
      gap={1}
    >
      <text fg={color}>
        <strong>{mode.label}</strong>
      </text>
    </box>
  );
}
