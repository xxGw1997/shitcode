import { useLocation, useParams } from "react-router";
import { z } from "zod";
import { useChat } from "@ai-sdk/react";
import {
  DefaultChatTransport,
  lastAssistantMessageIsCompleteWithToolCalls,
} from "ai";
import { createLocalToolRunner, modeToDeclarations } from "@shitcode/tools/runtime";
import { useEffect, useMemo, useRef } from "react";
import { client } from "../lib/client";
import { composeSystemPrompt } from "../lib/system-prompt";
import { useModeController } from "../lib/mode-context";
import { ChatShell } from "../components/chat/chat-shell";
import { ChatMessage } from "../components/chat/chat-message";

const chatStateSchema = z.object({
  prompt: z.string().optional(),
});

export function ChatScreen() {
  const { sessionId = "" } = useParams<{ sessionId: string }>();
  const location = useLocation();
  const { prompt = "" } = chatStateSchema.parse(location.state ?? {});
  const hasInitialPrompt = useRef(false);
  const { mode } = useModeController();

  const localToolRunner = useMemo(
    () => createLocalToolRunner({ workspaceRoot: process.cwd(), mode }),
    [mode],
  );
  const systemPrompt = useMemo(() => composeSystemPrompt(mode), [mode]);
  const toolsForServer = useMemo(() => modeToDeclarations(mode), [mode]);

  const systemPromptRef = useRef(systemPrompt);
  systemPromptRef.current = systemPrompt;
  const toolsRef = useRef(toolsForServer);
  toolsRef.current = toolsForServer;

  const api = client.chat.sessions[":id"].messages
    .$url({ param: { id: sessionId } })
    .toString();

  const { messages, sendMessage, status, addToolOutput } = useChat({
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
    if (prompt && !hasInitialPrompt.current && sessionId) {
      hasInitialPrompt.current = true;
      sendMessage({ text: prompt });
    }
  }, []);

  return (
    <ChatShell onSubmit={(text) => sendMessage({ text })}>
      {messages.map((msg) => (
        <ChatMessage key={msg.id} message={msg} />
      ))}
      {(status === "submitted" || status === "streaming") && (
        <text fg="#94a3b8">AI is thinking...</text>
      )}
    </ChatShell>
  );
}
