import { tool } from "ai";
import { z } from "zod";

export const readFileInputSchema = z.object({
  path: z.string(),
  offset: z.number().int().min(1).optional(),
  limit: z.number().int().min(1).max(500).optional(),
});

export const readFileTool = tool({
  description:
    "Read a UTF-8 text file from the user's local CLI workspace with line numbers.",
  inputSchema: readFileInputSchema,
});
