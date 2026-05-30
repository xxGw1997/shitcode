import { tool } from "ai";
import { z } from "zod";

export const deleteFileInputSchema = z.object({
  path: z.string(),
});

export const deleteFileTool = tool({
  description:
    "Delete a single file inside the user's local CLI workspace. Directories and recursive deletion are refused.",
  inputSchema: deleteFileInputSchema,
});
