import { sqliteTable, text, integer, index } from "drizzle-orm/sqlite-core";
import { relations } from "drizzle-orm";

export const messageModeValues = ["Build", "Plan"] as const;
export type MessageMode = (typeof messageModeValues)[number];

export type UserMessageMetadata = {
  mode: MessageMode;
};

export const sessions = sqliteTable("sessions", {
  id: text("id").primaryKey(),
  title: text("title"),
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull(),
});

export const messages = sqliteTable(
  "messages",
  {
    id: text("id").primaryKey(),
    sessionId: text("session_id")
      .notNull()
      .references(() => sessions.id, { onDelete: "cascade" }),
    role: text("role", { enum: ["system", "user", "assistant"] }).notNull(),
    parts: text("parts", { mode: "json" }).notNull(),
    metadata: text("metadata", { mode: "json" }).$type<UserMessageMetadata>(),
    model: text("model"),
    finishReason: text("finish_reason"),
    promptTokens: integer("prompt_tokens"),
    completionTokens: integer("completion_tokens"),
    createdAt: text("created_at").notNull(),
    updatedAt: text("updated_at").notNull(),
  },
  (table) => [
    index("messages_session_created_idx").on(table.sessionId, table.createdAt),
  ],
);

export const sessionsRelations = relations(sessions, ({ many }) => ({
  messages: many(messages),
}));

export const messagesRelations = relations(messages, ({ one }) => ({
  session: one(sessions, {
    fields: [messages.sessionId],
    references: [sessions.id],
  }),
}));

export type Session = typeof sessions.$inferSelect;
export type NewSession = typeof sessions.$inferInsert;
export type Message = typeof messages.$inferSelect;
export type NewMessage = typeof messages.$inferInsert;
