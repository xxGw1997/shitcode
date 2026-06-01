import { modes } from "@shitcode/tools/runtime";
import { useModeController } from "../../lib/mode-context";

const inactiveColor = "#475569";
const activeColor = "#facc15";
const separatorColor = "#334155";
const labelColor = "#94a3b8";

export function ModeBar() {
  const { mode, index } = useModeController();

  return (
    <box
      flexDirection="row"
      alignItems="center"
      flexShrink={0}
      marginTop={1}
      marginBottom={1}
      gap={1}
    >
      <text fg={labelColor}>mode:</text>
      {modes.map((entry, entryIndex) => {
        const isActive = entryIndex === index;
        return (
          <box key={entry.id} flexDirection="row" alignItems="center">
            {isActive ? (
              <text fg={activeColor}>
                <strong>{"\u25B8 "}</strong>
                <span fg={activeColor}>
                  <strong>{entry.label}</strong>
                </span>
              </text>
            ) : (
              <text fg={inactiveColor}>{entry.label}</text>
            )}
            {entryIndex < modes.length - 1 && (
              <text fg={separatorColor}> {"\u2502"} </text>
            )}
          </box>
        );
      })}
      <text fg={labelColor}>{" "}tab to switch</text>
      <text fg={inactiveColor}>{" "}{"\u2014"} {mode.description}</text>
    </box>
  );
}
