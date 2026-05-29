import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { createGreeting, runtimeName } from "@shitcode/shared";
import { streamText } from "ai";
import { createDeepSeek } from "@ai-sdk/deepseek";

const deepseek = createDeepSeek({
  baseURL: Bun.env.DEEPSEEK_BASE_URL!,
  apiKey: Bun.env.DEEPSEEK_API_KEY!,
});

const DEEPSEEK_MODEL = Bun.env.DEEPSEEK_MODEL!;

export const app = new Hono()
  .get("/", (c) => {
    return c.json({
      name: "@shitcode/server",
      message: createGreeting("@shitcode/server"),
    });
  })
  .get("/health", (c) => {
    return c.json({
      ok: true,
      timestamp: new Date().toISOString(),
      runtime: runtimeName,
    });
  })
  .post("/llm", zValidator("json", z.object({ prompt: z.string() })), async (c) => {
    const { prompt } = c.req.valid("json");

    console.log(prompt)
    const result = streamText({
      model: deepseek(DEEPSEEK_MODEL),
      prompt,
    });
    return result.toTextStreamResponse();
  });

export type AppType = typeof app;
