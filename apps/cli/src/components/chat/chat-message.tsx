import type { UIMessage } from "ai";
import type { ReactNode } from "react";
import type { MessageMode, UserMessageMetadata } from "@/lib/messages/message-metadata";
import { modeColors } from "@/lib/mode/mode-colors";
import { useModeController } from "@/lib/mode/mode-context";

type ChatMessageProps = {
  message: UIMessage;
};

type MessagePart = UIMessage["parts"][number];

type TextSegment =
  | { type: "text"; text: string }
  | { type: "system-reminder"; text: string };

type MessageBoxProps = {
  accentColor: string;
  children: ReactNode;
  marginTop?: number;
  marginBottom?: number;
};

const messageModeColors: Record<MessageMode, string> = {
  Build: modeColors.build,
  Plan: modeColors.plan,
};

const secondaryMessageColor = "#64748b";
const systemReminderColor = "#f59e0b";
const fileTokenColor = "#facc15";
const fileOutputTools = new Set([
  "read_file",
  "write_file",
  "edit_file",
  "delete_file",
  "list_files",
  "grep",
]);

function MessageBox({
  accentColor,
  children,
  marginTop = 0,
  marginBottom = 2,
}: MessageBoxProps) {
  return (
    <box
      flexDirection="column"
      marginTop={marginTop}
      marginBottom={marginBottom}
      border={["left"]}
      borderStyle="heavy"
      borderColor={accentColor}
      backgroundColor="#1E1E1E"
      padding={1}
    >
      {children}
    </box>
  );
}

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

function isToolPart(part: MessagePart): boolean {
  return part.type.startsWith("tool-");
}

function extractToolName(type: string): string {
  return type.startsWith("tool-") ? type.slice(5) : type;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function getPartRecord(part: MessagePart): Record<string, unknown> {
  return part as unknown as Record<string, unknown>;
}

function normalizeDisplayPath(value: string): string {
  return value.replace(/\//g, "\\");
}

function uniqueStrings(values: string[]) {
  return [...new Set(values)];
}

function getFileToolOutputPaths(toolName: string, output: unknown): string[] | null {
  if (!fileOutputTools.has(toolName) || !isRecord(output)) {
    return null;
  }

  if (toolName === "list_files" && Array.isArray(output.entries)) {
    const paths = output.entries
      .filter(isRecord)
      .map((entry) => entry.path)
      .filter((path): path is string => typeof path === "string");

    if (paths.length > 0) {
      return paths;
    }
  }

  if (toolName === "grep" && Array.isArray(output.matches)) {
    const paths = output.matches
      .filter(isRecord)
      .map((match) => match.path)
      .filter((path): path is string => typeof path === "string");

    if (paths.length > 0) {
      return uniqueStrings(paths);
    }
  }

  return typeof output.path === "string" ? [output.path] : null;
}

function formatToolOutput(toolName: string, output: unknown): string[] | null {
  const filePaths = getFileToolOutputPaths(toolName, output);

  if (filePaths != null) {
    return filePaths;
  }

  return [JSON.stringify(output)];
}

function countToolOutput(output: unknown): number | null {
  if (!isRecord(output)) {
    return null;
  }

  if (Array.isArray(output.entries)) {
    return output.entries.length;
  }

  if (Array.isArray(output.matches)) {
    return output.matches.length;
  }

  return null;
}

function formatOptions(input: Record<string, unknown>, names: string[]) {
  const options = names.flatMap((name) => {
    const value = input[name];
    return value == null ? [] : [`${name}=${String(value)}`];
  });

  return options.length > 0 ? ` [${options.join(", ")}]` : "";
}

function formatQuoted(value: unknown): string {
  return `"${String(value)}"`;
}

function formatToolCallLine(part: MessagePart): string {
  const record = getPartRecord(part);
  const name = extractToolName(part.type);
  const state = typeof record.state === "string" ? record.state : "unknown";
  const input = isRecord(record.input) ? record.input : {};
  const output = record.output;
  const count = countToolOutput(output);
  const countSuffix = count == null ? "" : ` (${count} matches)`;
  const stateSuffix = state === "output-error" ? " - error" : "";

  switch (name) {
    case "read_file": {
      const path = typeof input.path === "string" ? input.path : "unknown";
      return `→ Read ${normalizeDisplayPath(path)}${formatOptions(input, ["limit", "offset"])}${stateSuffix}`;
    }
    case "list_files": {
      const path = typeof input.path === "string" ? input.path : ".";
      return `✱ Glob ${formatQuoted(path)} in ${normalizeDisplayPath(path)}${countSuffix}${stateSuffix}`;
    }
    case "grep": {
      const query = input.query ?? "";
      const path = typeof input.path === "string" ? input.path : ".";
      const include = typeof input.include === "string" ? ` include ${formatQuoted(input.include)}` : "";
      return `✱ Grep ${formatQuoted(query)} in ${normalizeDisplayPath(path)}${include}${countSuffix}${stateSuffix}`;
    }
    case "write_file": {
      const path = typeof input.path === "string" ? input.path : "unknown";
      return `→ Write ${normalizeDisplayPath(path)}${stateSuffix}`;
    }
    case "edit_file": {
      const path = typeof input.path === "string" ? input.path : "unknown";
      return `→ Edit ${normalizeDisplayPath(path)}${stateSuffix}`;
    }
    case "delete_file": {
      const path = typeof input.path === "string" ? input.path : "unknown";
      return `→ Delete ${normalizeDisplayPath(path)}${stateSuffix}`;
    }
    case "run_powershell": {
      const command = input.command ?? "";
      return `→ PowerShell ${formatQuoted(command)}${formatOptions(input, ["timeoutMs"])}${stateSuffix}`;
    }
    case "run_bash": {
      const command = input.command ?? "";
      return `→ Bash ${formatQuoted(command)}${formatOptions(input, ["timeoutMs"])}${stateSuffix}`;
    }
    case "get_workspace_info":
      return `→ Workspace info${stateSuffix}`;
    default:
      return `→ ${name} ${toolStateLabel(state)}`;
  }
}

function splitSystemReminder(text: string): TextSegment[] {
  const segments: TextSegment[] = [];
  const pattern = /<system-reminder>\s*([\s\S]*?)\s*<\/system-reminder>/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = pattern.exec(text)) != null) {
    const before = text.slice(lastIndex, match.index);
    if (before.trim().length > 0) {
      segments.push({ type: "text", text: before.trim() });
    }

    segments.push({ type: "system-reminder", text: (match[1] ?? "").trim() });
    lastIndex = pattern.lastIndex;
  }

  const after = text.slice(lastIndex);
  if (after.trim().length > 0) {
    segments.push({ type: "text", text: after.trim() });
  }

  return segments;
}

function stripImageReferences(text: string) {
  return text.replace(/\n\nImage references:\n(?:\[Image\d+\]: .+\n?)+$/g, "");
}

function renderTextWithFileTokens(text: string) {
  const nodes: ReactNode[] = [];
  const pattern = /(@\S+|\[Image\d+\])/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = pattern.exec(text)) != null) {
    if (match.index > lastIndex) {
      nodes.push(text.slice(lastIndex, match.index));
    }

    nodes.push(
      <span key={`file-token-${match.index}`} fg={fileTokenColor}>
        <strong>{match[0]}</strong>
      </span>,
    );
    lastIndex = pattern.lastIndex;
  }

  if (lastIndex < text.length) {
    nodes.push(text.slice(lastIndex));
  }

  return nodes;
}

function getMessageModeColor(message: UIMessage): string | null {
  const metadata = message.metadata as UserMessageMetadata | undefined;
  return metadata?.mode ? messageModeColors[metadata.mode] : null;
}

export function ChatMessage({ message }: ChatMessageProps) {
  const { mode } = useModeController();
  const fallbackModeColor = modeColors[mode.id] ?? "#facc15";

  if (message.role === "user") {
    const modeColor = getMessageModeColor(message) ?? fallbackModeColor;
    const segments = message.parts.flatMap((part) =>
      part.type === "text" ? splitSystemReminder(part.text) : [],
    );

    return (
      <box flexDirection="column">
        {segments.map((segment, i) => (
          <MessageBox
            key={i}
            accentColor={segment.type === "system-reminder" ? systemReminderColor : modeColor}
          >
            {segment.type === "system-reminder" && (
              <text fg="#fbbf24">
                <strong>system reminder</strong>
              </text>
            )}
            <text fg={segment.type === "system-reminder" ? "#fcd34d" : "#e5e7eb"}>
              {segment.type === "system-reminder"
                ? segment.text
                : renderTextWithFileTokens(stripImageReferences(segment.text))}
            </text>
          </MessageBox>
        ))}
      </box>
    );
  }

  const renderedParts: ReactNode[] = [];
  let toolGroup: MessagePart[] = [];

  const flushToolGroup = () => {
    if (toolGroup.length === 0) {
      return;
    }

    const group = toolGroup;
    toolGroup = [];
    renderedParts.push(
      <MessageBox
        key={`tools-${renderedParts.length}`}
        accentColor={secondaryMessageColor}
        marginTop={1}
        marginBottom={1}
      >
        {group.map((part, i) => {
          const record = getPartRecord(part);
          const errorText =
            record.errorText != null ? String(record.errorText) : null;

          return (
            <box key={i} flexDirection="column">
              <text fg="#94a3b8">{formatToolCallLine(part)}</text>
              {errorText != null && <text fg="#ef4444">{errorText}</text>}
            </box>
          );
        })}
      </MessageBox>,
    );
  };

  message.parts.forEach((part, i) => {
    if (isToolPart(part)) {
      toolGroup.push(part);
      return;
    }

    flushToolGroup();

    switch (part.type) {
      case "text": {
        splitSystemReminder(part.text).forEach((segment, segmentIndex) => {
          if (segment.type === "system-reminder") {
            renderedParts.push(
              <MessageBox
                key={`reminder-${i}-${segmentIndex}`}
                accentColor={systemReminderColor}
                marginTop={1}
                marginBottom={1}
              >
                <text fg="#fbbf24">
                  <strong>system reminder</strong>
                </text>
                <text fg="#fcd34d">{segment.text}</text>
              </MessageBox>,
            );
            return;
          }

          renderedParts.push(
            <box key={`text-${i}-${segmentIndex}`} paddingLeft={2}>
              <text fg="#e5e7eb">
                {renderTextWithFileTokens(stripImageReferences(segment.text))}
              </text>
            </box>,
          );
        });
        break;
      }
      case "reasoning":
        renderedParts.push(
          <MessageBox
            key={`reasoning-${i}`}
            accentColor={secondaryMessageColor}
            marginTop={1}
            marginBottom={1}
          >
            <text fg="#64748b">
              <span fg="#475569">
                <strong>thinking...</strong>
              </span>
            </text>
            <text fg="#475569">{part.text}</text>
          </MessageBox>,
        );
        break;
      case "step-start":
        break;
      default:
        break;
    }
  });

  flushToolGroup();

  return (
    <box flexDirection="column" marginBottom={2}>
      <text>
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
      {renderedParts}
    </box>
  );
}
