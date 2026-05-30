import { tool } from "ai";
import { z } from "zod";

export const listFilesInputSchema = z.object({
  path: z.string().optional(),
  depth: z.number().int().min(1).max(8).optional(),
});

export const listFilesTool = tool({
  description: "List files and directories inside the user's local CLI workspace.",
  inputSchema: listFilesInputSchema,
});
