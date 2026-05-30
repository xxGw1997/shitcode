import { tool } from "ai";
import { z } from "zod";

export const runBashInputSchema = z.object({
  command: z.string(),
  cwd: z.string().optional(),
  timeoutMs: z.number().int().min(1000).max(120000).optional(),
});

export const runBashTool = tool({
  description:
    "Run a non-interactive bash command in the user's local CLI workspace for inspection or verification.",
  inputSchema: runBashInputSchema,
});
