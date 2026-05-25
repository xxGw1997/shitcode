import { TextAttributes } from "@opentui/core";
import { useNavigate } from "react-router";
import { useKeyboard } from "@opentui/react";
import { appRoutes } from "../navigation";

export function NotFoundScreen() {
  const navigate = useNavigate();

  useKeyboard((event) => {
    if (event.eventType === "press" && !event.repeated && event.name === "enter") {
      navigate(appRoutes.home);
    }
  });

  return (
    <box width="100%" height="100%" justifyContent="center" alignItems="center">
      <box flexDirection="column" alignItems="center" gap={1}>
        <text fg="#f87171" attributes={TextAttributes.BOLD}>
          Screen Not Found
        </text>
        <text fg="#94a3b8">Press Enter or F1 to return home.</text>
      </box>
    </box>
  );
}
