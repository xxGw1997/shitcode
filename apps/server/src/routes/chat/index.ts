import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { convertToModelMessages, stepCountIs, streamText, tool } from "ai";
import { createDeepSeek } from "@ai-sdk/deepseek";

const deepseek = createDeepSeek({
  baseURL: Bun.env.DEEPSEEK_BASE_URL!,
  apiKey: Bun.env.DEEPSEEK_API_KEY!,
});

const DEEPSEEK_MODEL = Bun.env.DEEPSEEK_MODEL!;

const messageSchema = z.object({
  id: z.string(),
  role: z.enum(["system", "user", "assistant"]),
  parts: z.array(z.object({ type: z.string() }).passthrough()),
});

export const chatRoute = new Hono().post(
  "/",
  zValidator("json", z.object({ messages: z.array(messageSchema) })),
  async (c) => {
    const { messages } = c.req.valid("json");

    const result = streamText({
      model: deepseek(DEEPSEEK_MODEL),
      system: "You are a helpful AI assistant.",
      messages: await convertToModelMessages(
        messages as Parameters<typeof convertToModelMessages>[0],
      ),
      tools: {
        getTime: tool({
          description: "Get the current date and time for the user.",
          inputSchema: z.object({
            timezone: z
              .string()
              .optional()
              .describe("Optional IANA timezone, e.g. 'America/New_York'"),
          }),
          execute: async ({ timezone }) => ({
            iso: new Date().toISOString(),
            unix: Date.now(),
            timezone: timezone ?? "UTC",
          }),
        }),
      },
      stopWhen: stepCountIs(5)
    });
    return result.toUIMessageStreamResponse();
  },
);