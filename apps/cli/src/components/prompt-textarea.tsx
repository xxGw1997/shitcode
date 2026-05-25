type PromptTextareaProps = {
  width: number;
  height?: number;
};

export function PromptTextarea({ width, height = 5 }: PromptTextareaProps) {
  return (
    <box
      width={width}
      height={height}
      border
      borderStyle="rounded"
      borderColor="#4b5563"
      backgroundColor="#0f172a"
      padding={1}
    >
      <textarea
        width={Math.max(width - 2, 1)}
        height={Math.max(height - 2, 1)}
        focused
        wrapMode="word"
        placeholder="Ask shitcode..."
        placeholderColor="#64748b"
        textColor="#e5e7eb"
        backgroundColor="#0f172a"
        focusedTextColor="#f8fafc"
        focusedBackgroundColor="#0f172a"
        cursorColor="#facc15"
      />
    </box>
  );
}
