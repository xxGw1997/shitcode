import { useLocation } from "react-router";
import { z } from "zod";
import { useCompletion } from "@ai-sdk/react";
import { useEffect } from "react";
import { client } from "../lib/client";

const chatStateSchema = z.object({
  prompt: z.string().optional(),
});

export function ChatScreen() {
  const location = useLocation();
  const { prompt = "" } = chatStateSchema.parse(location.state ?? {});

  const { completion, complete, error, isLoading } = useCompletion({
    api: client.llm.$url().toString(),
    streamProtocol: "text",
  });

  useEffect(() => {
    if (prompt) {
      complete(prompt);
    }
  }, []);

  return (
    <box
      width="100%"
      height="100%"
      flexDirection="column"
      backgroundColor="#0a0a0a"
    >
      <box
        width="100%"
        height="100%"
        justifyContent="center"
        alignItems="center"
        backgroundColor="#0a0a0a"
      >
        {prompt ? (
          <box flexDirection="column" alignItems="center" gap={1} backgroundColor="#0a0a0a">
            <text fg="#facc15" attributes={2}>
              Prompt:
            </text>
            <text fg="#e5e7eb">{prompt}</text>
            {isLoading && <text fg="#94a3b8">Loading...</text>}
            {completion && (
              <box flexDirection="column" marginTop={1} backgroundColor="#0a0a0a">
                <text fg="#22d3ee" attributes={2}>
                  Response:
                </text>
                <text fg="#e5e7eb">{completion}</text>
              </box>
            )}
            {error && <text fg="#ef4444">Error: {error.message}</text>}
          </box>
        ) : (
          <text fg="#94a3b8">TODO Chat Streaming</text>
        )}
      </box>
    </box>
  );
}