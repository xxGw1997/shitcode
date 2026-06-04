import type { ScrollBoxRenderable } from "@opentui/core";
import { useEffect, useRef, type ReactNode } from "react";
import { ChatTextarea } from "./chat-textarea";

type ChatShellProps = {
  children: ReactNode;
  onSubmit: (text: string) => void;
  scrollToBottomKey?: unknown;
};

export function ChatShell({ children, onSubmit, scrollToBottomKey }: ChatShellProps) {
  const scrollRef = useRef<ScrollBoxRenderable>(null);

  useEffect(() => {
    if (scrollToBottomKey == null) {
      return;
    }

    const timeout = setTimeout(() => {
      const scrollbox = scrollRef.current;
      scrollbox?.scrollTo({ x: 0, y: scrollbox.scrollHeight });
    }, 0);

    return () => clearTimeout(timeout);
  }, [scrollToBottomKey]);

  return (
    <box
      width="100%"
      height="100%"
      flexDirection="column"
      overflow="hidden"
      paddingLeft={2}
      paddingRight={2}
    >
      <scrollbox
        ref={scrollRef}
        flexGrow={1}
        flexShrink={1}
        minHeight={0}
        focused
        paddingTop={1}
        stickyScroll
        stickyStart="bottom"
      >
        {children}
      </scrollbox>
      <box flexShrink={0}>
        <ChatTextarea onSubmit={onSubmit} />
      </box>
    </box>
  );
}
