import type { ReactNode } from "react";
import { ChatTextarea } from "./chat-textarea";

type ChatShellProps = {
  children: ReactNode;
  onSubmit: (text: string) => void;
};

export function ChatShell({ children, onSubmit }: ChatShellProps) {
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
      <box marginTop={1} flexShrink={0}>
        <ChatTextarea onSubmit={onSubmit} />
      </box>
    </box>
  );
}
