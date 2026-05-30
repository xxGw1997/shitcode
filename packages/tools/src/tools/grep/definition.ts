import { tool } from "ai";
import { z } from "zod";

export const grepInputSchema = z.object({
  query: z.string(),
  path: z.string().optional(),
  include: z.string().optional(),
  regex: z.boolean().optional(),
});

export const grepTool = tool({
  description:
    "Search file contents inside the user's local CLI workspace and return matching lines.",
  inputSchema: grepInputSchema,
});
