import { createDeepSeek } from "@ai-sdk/deepseek";
import { ToolLoopAgent, stepCountIs, type Tool } from "ai";

const deepseek = createDeepSeek({
  baseURL: Bun.env.DEEPSEEK_BASE_URL!,
  apiKey: Bun.env.DEEPSEEK_API_KEY!,
});

export const DEEPSEEK_MODEL = Bun.env.DEEPSEEK_MODEL!;

export type CodingAgentOptions = {
  instructions: string;
  tools: Readonly<Record<string, Tool>>;
};

export function createCodingAgent({ instructions, tools }: CodingAgentOptions) {
  return new ToolLoopAgent({
    id: "coding-agent",
    model: deepseek(DEEPSEEK_MODEL),
    instructions,
    tools,
    stopWhen: stepCountIs(20),
  });
}
