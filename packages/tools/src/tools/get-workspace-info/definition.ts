import { tool } from "ai";
import { z } from "zod";

export const getWorkspaceInfoInputSchema = z.object({});

export const getWorkspaceInfoTool = tool({
  description:
    "Get information about the user's local CLI workspace and tool guardrails.",
  inputSchema: getWorkspaceInfoInputSchema,
});
