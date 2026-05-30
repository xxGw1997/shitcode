import { tool } from "ai";
import { z } from "zod";

export const writeFileInputSchema = z.object({
  path: z.string(),
  content: z.string(),
});

export const writeFileTool = tool({
  description:
    "Create or overwrite a UTF-8 text file inside the user's local CLI workspace.",
  inputSchema: writeFileInputSchema,
});
