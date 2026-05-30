import { useLocation, useParams } from "react-router";
import { z } from "zod";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { useEffect, useRef } from "react";
import { client } from "../lib/client";
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

  const api = client.chat.sessions[":id"].messages
    .$url({ param: { id: sessionId } })
    .toString();

  const { messages, sendMessage, status } = useChat({
    transport: new DefaultChatTransport({ api }),
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
