import { useModeController } from "@/lib/mode/mode-context";
import { useModeColor, useTheme } from "@/lib/theme";

const MOCK_MODEL = "iPhone 17 Pro Max 2TB"
const MOCK_PROVIDER = "xxgw"

export function ModeBar() {
  const { mode } = useModeController();
  const theme = useTheme();
  const color = useModeColor(mode.id);

  return (
    <box
      flexDirection="row"
      alignItems="center"
      gap={2}
    >
      <text fg={color}>
        <strong>{mode.label}</strong>
      </text>
      <text fg={theme.colors.white}>
        {MOCK_MODEL}
      </text>
      <text fg={theme.colors.gray}>
        {MOCK_PROVIDER}
      </text>
    </box>
  );
}
