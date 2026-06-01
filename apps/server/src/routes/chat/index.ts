import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { createAgentUIStreamResponse, generateId, tool } from "ai";
import { jsonSchema } from "@ai-sdk/provider-utils";
import { db, sessions, messages } from "@shitcode/database";
import { eq, desc } from "drizzle-orm";
import { createCodingAgent } from "../../agents/coding-agent";

const messageSchema = z.object({
  id: z.string(),
  role: z.enum(["system", "user", "assistant"]),
  parts: z.array(z.object({ type: z.string() }).passthrough()),
});

const toolDeclarationSchema = z.object({
  name: z.string().min(1),
  description: z.string().min(1),
  inputSchema: z.record(z.string(), z.unknown()),
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
        systemPrompt: z.string().min(1),
        tools: z.array(toolDeclarationSchema),
      }),
    ),
    async (c) => {
      const { messages: uiMessages, systemPrompt, tools: declarations } =
        c.req.valid("json");
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

      if (Bun.env.DEBUG_SYSTEM_PROMPT === "1") {
        console.log("[chat] system prompt:\n" + systemPrompt);
      }

      const tools = Object.fromEntries(
        declarations.map((d) => [
          d.name,
          tool({
            description: d.description,
            inputSchema: jsonSchema(d.inputSchema as Record<string, unknown>),
          }),
        ]),
      );

      const agent = createCodingAgent({ instructions: systemPrompt, tools });

      let promptTokens = 0;
      let completionTokens = 0;
      let hasUsage = false;

      return createAgentUIStreamResponse({
        agent,
        uiMessages,
        generateMessageId: generateId,
        onStepFinish: ({ usage }) => {
          promptTokens += usage.inputTokens ?? 0;
          completionTokens += usage.outputTokens ?? 0;
          hasUsage = true;
        },
        onFinish: async ({ responseMessage, finishReason }) => {
          const finishedAt = new Date().toISOString();

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

            await db
              .insert(messages)
              .values({
                id: responseMessage.id,
                sessionId,
                role: "assistant",
                parts: responseMessage.parts,
                model: Bun.env.DEEPSEEK_MODEL!,
                finishReason,
                promptTokens: hasUsage ? promptTokens : undefined,
                completionTokens: hasUsage ? completionTokens : undefined,
                createdAt: finishedAt,
                updatedAt: finishedAt,
              })
              .onConflictDoUpdate({
                target: messages.id,
                set: {
                  parts: responseMessage.parts,
                  model: Bun.env.DEEPSEEK_MODEL!,
                  finishReason,
                  promptTokens: hasUsage ? promptTokens : undefined,
                  completionTokens: hasUsage ? completionTokens : undefined,
                  updatedAt: finishedAt,
                },
              });
          } catch (err) {
            console.error("Failed to persist assistant message:", err);
          }
        },
      });
    },
  );
