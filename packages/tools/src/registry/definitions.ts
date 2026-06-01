import { allTools } from "./tool-groups";
import { defaultMode } from "./modes";

export { modes, defaultMode, getMode, getModeIndex, modeToDeclarations } from "./modes";
export type { Mode, ToolDeclaration } from "./modes";
export { readOnlyTools, writeTools, execTools, allTools } from "./tool-groups";

export const codingAgentTools = allTools;

export const codingAgentSystemPrompt = defaultMode.instructions;
