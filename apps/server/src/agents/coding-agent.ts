import { createDeepSeek } from "@ai-sdk/deepseek";
import { ToolLoopAgent, stepCountIs, type InferAgentUIMessage } from "ai";
import { codingAgentSystemPrompt, codingAgentTools } from "@shitcode/tools";

const deepseek = createDeepSeek({
  baseURL: Bun.env.DEEPSEEK_BASE_URL!,
  apiKey: Bun.env.DEEPSEEK_API_KEY!,
});

export const DEEPSEEK_MODEL = Bun.env.DEEPSEEK_MODEL!;

export const codingAgent = new ToolLoopAgent({
  id: "coding-agent",
  model: deepseek(DEEPSEEK_MODEL),
  instructions: codingAgentSystemPrompt,
  tools: codingAgentTools,
  stopWhen: stepCountIs(20),
});

export type CodingAgentUIMessage = InferAgentUIMessage<typeof codingAgent>;
