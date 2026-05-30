import { tool } from "ai";
import { z } from "zod";

export const editFileInputSchema = z.object({
  path: z.string(),
  oldText: z.string(),
  newText: z.string(),
});

export const editFileTool = tool({
  description:
    "Edit a file by replacing exactly one occurrence of oldText with newText inside the user's local CLI workspace.",
  inputSchema: editFileInputSchema,
});
