import type { UIMessage } from "ai";

type ChatMessageProps = {
  message: UIMessage;
};

function toolStateLabel(state: string): string {
  switch (state) {
    case "input-streaming":
      return "reading input...";
    case "input-available":
      return "input ready";
    case "output-available":
      return "done";
    case "output-error":
      return "error";
    case "approval-requested":
      return "needs approval";
    case "approval-responded":
      return "approved";
    case "output-denied":
      return "denied";
    default:
      return state;
  }
}

function extractToolName(type: string): string {
  return type.startsWith("tool-") ? type.slice(5) : type;
}

export function ChatMessage({ message }: ChatMessageProps) {
  return (
    <box flexDirection="column" marginBottom={2}>
      <text>
        {message.role === "user" && (
          <span fg="#facc15">
            <strong>You:</strong>
          </span>
        )}
        {message.role === "assistant" && (
          <span fg="#22d3ee">
            <strong>AI:</strong>
          </span>
        )}
        {message.role === "system" && (
          <span fg="#94a3b8">
            <strong>System:</strong>
          </span>
        )}
      </text>
      {message.parts.map((part, i) => {
        switch (part.type) {
          case "text":
            return (
              <text key={i} fg="#e5e7eb">
                {part.text}
              </text>
            );
          case "reasoning":
            return (
              <box key={i} flexDirection="column" marginTop={1} marginBottom={1}>
                <text fg="#64748b">
                  <span fg="#475569">
                    <strong>thinking...</strong>
                  </span>
                </text>
                <text fg="#475569">{part.text}</text>
              </box>
            );
          case "step-start":
            return null;
          default: {
            const name = extractToolName(part.type);
            const state = "state" in part ? String(part.state) : "unknown";
            const output =
              "output" in part && part.output != null
                ? JSON.stringify(part.output)
                : null;
            const errorText =
              "errorText" in part && part.errorText != null
                ? String(part.errorText)
                : null;

            return (
              <box key={i} flexDirection="column" marginTop={1} marginBottom={1}>
                <text fg="#a78bfa">
                  <span fg="#7c3aed">
                    <strong>[tool:{name}]</strong>
                  </span>{" "}
                  <span fg="#94a3b8">{toolStateLabel(state)}</span>
                </text>
                {output != null && (
                  <text fg="#94a3b8">{output}</text>
                )}
                {errorText != null && (
                  <text fg="#ef4444">{errorText}</text>
                )}
              </box>
            );
          }
        }
      })}
    </box>
  );
}