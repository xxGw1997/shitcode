import { tool } from "ai";
import { z } from "zod";

export const runPowerShellInputSchema = z.object({
  command: z.string(),
  cwd: z.string().optional(),
  timeoutMs: z.number().int().min(1000).max(120000).optional(),
  shell: z.enum(["auto", "pwsh", "powershell"]).optional(),
});

export const runPowerShellTool = tool({
  description:
    "Run a non-interactive PowerShell command in the user's local CLI workspace. Prefer this tool on Windows; uses pwsh (PowerShell Core) when available, otherwise falls back to powershell.exe. Do not run interactive commands.",
  inputSchema: runPowerShellInputSchema,
});
