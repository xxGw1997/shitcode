import { useModeController } from "../../lib/mode-context";
import { modeColors } from "../../lib/mode-colors";

export { modeColors };

const MOCK_MODEL = "iPhone 17 Pro Max 2TB"
const MOCK_PROVIDER = "xxgw"

export function ModeBar() {
  const { mode } = useModeController();
  const color = modeColors[mode.id] ?? "#facc15";

  return (
    <box
      flexDirection="row"
      alignItems="center"
      gap={2}
    >
      <text fg={color}>
        <strong>{mode.label}</strong>
      </text>
      <text fg="#FFFFFF">
        {MOCK_MODEL}
      </text>
      <text fg="#808080">
        {MOCK_PROVIDER}
      </text>
    </box>
  );
}
