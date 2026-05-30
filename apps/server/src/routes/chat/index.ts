import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { convertToModelMessages, stepCountIs, streamText, tool, generateId } from "ai";
import { createDeepSeek } from "@ai-sdk/deepseek";
import { db, sessions, messages } from "@shitcode/database";
import { eq, desc } from "drizzle-orm";

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

export const chatRoute = new Hono()
  .get("/sessions", async (c) => {
    const result = await db
      .select()
      .from(sessions)
      .orderBy(desc(sessions.updatedAt));
    return c.json(result);
  })
  .get("/sessions/:id", async (c) => {
    const result = await db
      .select()
      .from(messages)
      .where(eq(messages.sessionId, c.req.param("id")))
      .orderBy(messages.createdAt);
    return c.json(result);
  })
  .post(
    "/sessions",
    zValidator(
      "json",
      z.object({
        title: z.string().optional(),
      }),
    ),
    async (c) => {
      const { title = null } = c.req.valid("json");
      const id = crypto.randomUUID();
      const now = new Date().toISOString();

      await db.insert(sessions).values({
        id,
        title,
        createdAt: now,
        updatedAt: now,
      });

      return c.json({ id, title, createdAt: now, updatedAt: now }, 201);
    },
  )
  .post(
    "/sessions/:id/messages",
    zValidator(
      "json",
      z.object({
        messages: z.array(messageSchema),
      }),
    ),
    async (c) => {
      const { messages: uiMessages } = c.req.valid("json");
      const sessionId = c.req.param("id");
      const now = new Date().toISOString();

      await db
        .update(sessions)
        .set({ updatedAt: now })
        .where(eq(sessions.id, sessionId));

      await Promise.all(
        uiMessages.map((m) =>
          db
            .insert(messages)
            .values({
              id: m.id,
              sessionId,
              role: m.role,
              parts: m.parts,
              createdAt: now,
              updatedAt: now,
            })
            .onConflictDoNothing(),
        ),
      );

      const firstUser = uiMessages.find((m) => m.role === "user");
      let title: string | null = null;
      if (firstUser) {
        const textPart = firstUser.parts.find((p) => p.type === "text") as
          | { text?: string }
          | undefined;
        if (textPart?.text) {
          title = textPart.text.slice(0, 80);
        }
      }

      const result = streamText({
        model: deepseek(DEEPSEEK_MODEL),
        system: "You are a helpful AI assistant.",
        messages: await convertToModelMessages(
          uiMessages as Parameters<typeof convertToModelMessages>[0],
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
        stopWhen: stepCountIs(5),
        onFinish: async ({ text, toolCalls, finishReason, totalUsage }) => {
          const finishedAt = new Date().toISOString();
          const parts: Array<Record<string, unknown>> = [];

          if (text) {
            parts.push({ type: "text", text, state: "done" });
          }

          for (const tc of toolCalls ?? []) {
            parts.push({
              type: `tool-${tc.toolName}`,
              toolCallId: tc.toolCallId,
              state: "output-available",
              input: tc.input,
              output: (tc as { output?: unknown }).output,
            });
          }

          try {
            const updateValues: Record<string, unknown> = {
              updatedAt: finishedAt,
            };

            if (title !== null) {
              const existingSession = await db
                .select({ title: sessions.title })
                .from(sessions)
                .where(eq(sessions.id, sessionId))
                .get();
              if (!existingSession || existingSession.title === null) {
                updateValues.title = title;
              }
            }

            await db
              .update(sessions)
              .set(updateValues)
              .where(eq(sessions.id, sessionId));

            await db.insert(messages).values({
              id: generateId(),
              sessionId,
              role: "assistant",
              parts,
              model: DEEPSEEK_MODEL,
              finishReason,
              promptTokens: totalUsage?.inputTokens,
              completionTokens: totalUsage?.outputTokens,
              createdAt: finishedAt,
              updatedAt: finishedAt,
            });
          } catch (err) {
            console.error("Failed to persist assistant message:", err);
          }
        },
      });

      return result.toUIMessageStreamResponse();
    },
  );