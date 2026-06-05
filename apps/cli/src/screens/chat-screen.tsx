import { useLocation, useParams } from "react-router";
import { z } from "zod";
import { useChat } from "@ai-sdk/react";
import {
  DefaultChatTransport,
  type UIMessage,
  lastAssistantMessageIsCompleteWithToolCalls,
} from "ai";
import { createLocalToolRunner, modeToDeclarations } from "@shitcode/tools/runtime";
import { useEffect, useMemo, useRef, useState } from "react";
import { client } from "@/lib/api/client";
import { useModeController } from "@/lib/mode/mode-context";
import {
  createUserMessageMetadata,
  type UserMessageMetadata,
} from "@/lib/messages/message-metadata";
import { composeSystemPrompt } from "@/lib/system/system-prompt";
import { messageModeValues } from "@shitcode/database/schema";
import { ChatMessage } from "@/components/chat/chat-message";
import { ChatShell } from "@/components/chat/chat-shell";
import { useTheme } from "@/lib/theme";

const userMessageMetadataSchema = z.object({
  mode: z.enum(messageModeValues),
}).strict() satisfies z.ZodType<UserMessageMetadata>;

const chatStateSchema = z.object({
  prompt: z.string().optional(),
  promptMetadata: userMessageMetadataSchema.optional(),
});

const storedMessageSchema = z.object({
  id: z.string(),
  role: z.enum(["system", "user", "assistant"]),
  parts: z.array(z.object({ type: z.string() }).passthrough()),
  metadata: userMessageMetadataSchema.nullish(),
});

const storedMessagesSchema = z.array(storedMessageSchema);

export function ChatScreen() {
  const { sessionId = "" } = useParams<{ sessionId: string }>();
  const location = useLocation();
  const { prompt = "", promptMetadata } = chatStateSchema.parse(location.state ?? {});
  const hasInitialPrompt = useRef(false);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyLoaded, setHistoryLoaded] = useState(false);
  const [historyError, setHistoryError] = useState<string | null>(null);
  const { mode } = useModeController();
  const theme = useTheme();

  const localToolRunner = useMemo(
    () => createLocalToolRunner({ workspaceRoot: process.cwd(), mode }),
    [mode],
  );
  const systemPrompt = useMemo(() => composeSystemPrompt(mode), [mode]);
  const toolsForServer = useMemo(() => modeToDeclarations(mode), [mode]);
  const currentMessageMetadata = useMemo(
    () => createUserMessageMetadata(mode),
    [mode],
  );

  const systemPromptRef = useRef(systemPrompt);
  systemPromptRef.current = systemPrompt;
  const toolsRef = useRef(toolsForServer);
  toolsRef.current = toolsForServer;

  const api = client.chat.sessions[":id"].messages
    .$url({ param: { id: sessionId } })
    .toString();

  const { messages, sendMessage, status, addToolOutput, setMessages } = useChat({
    id: sessionId,
    transport: new DefaultChatTransport({
      api,
      body: () => ({ systemPrompt: systemPromptRef.current, tools: toolsRef.current }),
    }),
    sendAutomaticallyWhen: lastAssistantMessageIsCompleteWithToolCalls,
    async onToolCall({ toolCall }) {
      if (toolCall.dynamic) {
        return;
      }

      try {
        const output = await localToolRunner.run(
          toolCall.toolName,
          toolCall.input,
        );

        addToolOutput({
          tool: toolCall.toolName,
          toolCallId: toolCall.toolCallId,
          output,
        });
      } catch (error) {
        addToolOutput({
          tool: toolCall.toolName,
          toolCallId: toolCall.toolCallId,
          state: "output-error",
          errorText: error instanceof Error ? error.message : String(error),
        });
      }
    },
  });

  useEffect(() => {
    let cancelled = false;

    hasInitialPrompt.current = false;
    setHistoryLoaded(false);
    setHistoryError(null);
    setMessages([]);

    if (!sessionId) {
      setHistoryLoading(false);
      return;
    }

    async function loadHistory() {
      setHistoryLoading(true);

      try {
        const res = await client.chat.sessions[":id"].$get({
          param: { id: sessionId },
        });

        if (!res.ok) {
          throw new Error(`Failed to load history (${res.status})`);
        }

        const storedMessages = storedMessagesSchema.parse(await res.json());
        const historyMessages = storedMessages.map(toUIMessage);

        if (!cancelled) {
          setMessages(historyMessages);
          setHistoryLoaded(true);
        }
      } catch (error) {
        if (!cancelled) {
          setHistoryError(
            error instanceof Error ? error.message : "Failed to load history",
          );
          setHistoryLoaded(true);
        }
      } finally {
        if (!cancelled) {
          setHistoryLoading(false);
        }
      }
    }

    loadHistory();

    return () => {
      cancelled = true;
    };
  }, [sessionId, setMessages]);

  useEffect(() => {
    if (prompt && historyLoaded && !hasInitialPrompt.current && sessionId) {
      hasInitialPrompt.current = true;
      sendMessage({
        text: prompt,
        metadata: promptMetadata ?? currentMessageMetadata,
      });
    }
  }, [
    currentMessageMetadata,
    historyLoaded,
    prompt,
    promptMetadata,
    sendMessage,
    sessionId,
  ]);

  const handleSubmit = (text: string) => {
    sendMessage({ text, metadata: currentMessageMetadata });
  };

  return (
    <ChatShell
      onSubmit={handleSubmit}
      scrollToBottomKey={historyLoaded ? sessionId : undefined}
    >
      {historyLoading && <text fg={theme.colors.textMuted}>Loading history...</text>}
      {historyError && <text fg={theme.colors.error}>{historyError}</text>}
      {messages.map((msg) => (
        <ChatMessage key={msg.id} message={msg} />
      ))}
      {(status === "submitted" || status === "streaming") && (
        <text fg={theme.colors.textMuted}>AI is thinking...</text>
      )}
    </ChatShell>
  );
}

function toUIMessage(message: z.infer<typeof storedMessageSchema>): UIMessage {
  return {
    id: message.id,
    role: message.role,
    parts: message.parts as UIMessage["parts"],
    metadata: message.metadata ?? undefined,
  };
}
