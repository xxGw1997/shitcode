import { TextAttributes } from "@opentui/core";

export function HelpScreen() {
  return (
    <box width="100%" height="100%" justifyContent="center" alignItems="center">
      <box
        width={72}
        border
        borderStyle="rounded"
        borderColor="#4ade80"
        backgroundColor="#0f172a"
        padding={1}
        flexDirection="column"
        gap={1}
      >
        <text fg="#4ade80" attributes={TextAttributes.BOLD}>
          Structure
        </text>
        <text fg="#e2e8f0">`index.tsx` bootstraps the renderer only.</text>
        <text fg="#e2e8f0">`app.tsx` owns app-level providers.</text>
        <text fg="#e2e8f0">`route/router.tsx` defines routes in one place.</text>
        <text fg="#e2e8f0">`route/root-layout.tsx` handles shell and shortcuts.</text>
        <text fg="#e2e8f0">`route/screens/` keeps each route focused and testable.</text>
        <text fg="#94a3b8" attributes={TextAttributes.DIM}>
          Shortcuts: F1 Home, F2 Help, Esc Quit
        </text>
      </box>
    </box>
  );
}
