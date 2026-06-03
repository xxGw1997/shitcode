import { TextAttributes } from "@opentui/core";
import { useTerminalDimensions } from "@opentui/react";

const cliVersion = Bun.env.npm_package_version ?? "0.1.0";
const statusVersion = `v${cliVersion}`;

export function StatusBar() {
  const { width } = useTerminalDimensions();
  const cwd = Bun.env.INIT_CWD ?? process.cwd();
  const cwdWidth = Math.max(width - statusVersion.length - 4, 1);

  return (
    <box
      flexDirection="row"
      justifyContent="space-between"
      flexShrink={0}
      paddingLeft={1}
      paddingRight={1}
      backgroundColor="#0a0a0a"
    >
      <text width={cwdWidth} truncate fg="#94a3b8" attributes={TextAttributes.DIM}>
        {cwd}
      </text>
      <text fg="#94a3b8" attributes={TextAttributes.DIM}>
        {statusVersion}
      </text>
    </box>
  );
}
