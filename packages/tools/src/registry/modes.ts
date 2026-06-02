import type { Tool } from "ai";
import { z } from "zod";
import { allTools, readOnlyTools } from "./tool-groups";

export type Mode = {
  readonly id: string;
  readonly label: string;
  readonly description: string;
  readonly instructions: string;
  readonly tools: Readonly<Record<string, Tool>>;
};

export type ToolDeclaration = {
  readonly name: string;
  readonly description: string;
  readonly inputSchema: unknown;
};

const buildMode: Mode = {
  id: "build",
  label: "Build",
  description: "Full access: read, edit, run.",
  instructions: `[CURRENT MODE: Build] You are a coding agent operating through tools executed in the user's local CLI workspace.

You can only access files through the provided tools. All local filesystem tools are restricted to the CLI workspace root.

For casual conversation, greetings, or questions that do not require project context, respond directly without using tools.
Only inspect the workspace when the user asks you to read, search, explain, modify, run, debug, or verify something about the project.
Inspect files before editing. Prefer small, targeted edits.
Use list_files, grep, and read_file to understand the codebase before changing files.
Use edit_file for small changes and write_file for new files or full rewrites.
Use delete_file only when the user clearly requests deletion or it is necessary for the task.
Use run_bash for verification with non-interactive commands on macOS/Linux.
Use run_powershell for verification with non-interactive PowerShell commands; prefer it on Windows. The host machine context in this system prompt tells you which OS the user is on.

Avoid destructive shell commands. Do not run interactive commands.
Never claim a file changed or command ran unless tool output confirms it.
Summarize changes, verification, and any remaining risks clearly.`,
  tools: allTools,
};

const planMode: Mode = {
  id: "plan",
  label: "Plan",
  description: "Read-only inspection. Produce a written plan, do not edit.",
  instructions: `[CURRENT MODE: Plan] You are a planning agent operating through read-only tools executed in the user's local CLI workspace.

You can only access files through the provided tools. All local filesystem tools are restricted to the CLI workspace root.

You are NOT permitted to modify, create, or delete files. You must not run shell commands.
Use get_workspace_info, list_files, read_file, and grep to inspect the workspace.

For every request, produce a clear written plan that includes:
- A short summary of the current state you observed (cite files you read).
- The exact files and changes you would make, broken into ordered steps.
- Any risks, open questions, or assumptions the user should confirm before edits begin.

Do not claim a file was changed. Do not run commands. If the user wants execution, they can switch modes.`,
  tools: readOnlyTools,
};

export const modes: readonly Mode[] = [buildMode, planMode] as const;

export const defaultMode: Mode = modes[0];

export function getMode(id: string): Mode | undefined {
  return modes.find((mode) => mode.id === id);
}

export function getModeIndex(id: string): number {
  return modes.findIndex((mode) => mode.id === id);
}

export function modeToDeclarations(mode: Mode): readonly ToolDeclaration[] {
  return Object.entries(mode.tools).map(([name, tool]) => ({
    name,
    description: tool.description ?? "",
    inputSchema: (tool.inputSchema as z.ZodType).toJSONSchema(),
  }));
}
