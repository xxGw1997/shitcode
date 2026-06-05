import {
  SyntaxStyle,
  RGBA,
  type KeyBinding,
  type OptimizedBuffer,
  type TextareaRenderable,
} from "@opentui/core";
import { useKeyboard } from "@opentui/react";
import { useEffect, useRef, useState } from "react";
import { useCommandSuggestions } from "@/lib/commands/use-command-suggestions";
import type { FileSuggestion } from "@/lib/files/file-suggestions";
import { useFileSuggestions } from "@/lib/files/use-file-suggestions";
import { modeColors } from "@/lib/mode/mode-colors";
import { useModeController } from "@/lib/mode/mode-context";
import { CommandSuggestions } from "./command-suggestions";
import { FileSuggestions } from "./file-suggestions";
import { ModeBar } from "./mode-bar";

type ChatTextareaProps = {
  onSubmit: (text: string) => void;
};

const minRows = 3;
const maxRows = 6;
const submitKeyBindings: KeyBinding[] = [
  { name: "return", action: "submit" },
  { name: "return", ctrl: true, action: "newline" },
];
const fileTokenHighlightName = "selected-file-token";

type SelectedFileToken = {
  displayText: string;
  path: string;
  isImage: boolean;
};

export function ChatTextarea({ onSubmit }: ChatTextareaProps) {
  const textareaRef = useRef<TextareaRenderable>(null);
  const fileTokenStyleRef = useRef<{ style: SyntaxStyle; styleId: number } | null>(null);
  const imageCounterRef = useRef(0);
  const previousTextRef = useRef("");
  const selectedFileTokensRef = useRef<SelectedFileToken[]>([]);
  const replacingFileTokenRef = useRef(false);
  const { mode } = useModeController();
  const modeColor = modeColors[mode.id] ?? "#facc15";
  const [rows, setRows] = useState(minRows);
  const [selectedFileTokens, setSelectedFileTokens] = useState<SelectedFileToken[]>([]);
  const [fileTokenStyle, setFileTokenStyle] = useState<{
    style: SyntaxStyle;
    styleId: number;
  } | null>(null);
  const commandSuggestions = useCommandSuggestions({
    onDismiss: () => {
      selectedFileTokensRef.current = [];
      previousTextRef.current = "";
      textareaRef.current?.clear();
      setSelectedFileTokens([]);
      setRows(minRows);
    },
  });
  const fileSuggestions = useFileSuggestions({
    enabled: !commandSuggestions.isVisible,
  });

  useEffect(() => {
    const style = SyntaxStyle.create();
    const styleId = style.registerStyle(fileTokenHighlightName, {
      fg: "#facc15",
      bold: true,
    });
    fileTokenStyleRef.current = { style, styleId };
    setFileTokenStyle({ style, styleId });

    return () => {
      fileTokenStyleRef.current = null;
      setFileTokenStyle(null);
      style.destroy();
    };
  }, []);

  useEffect(() => {
    selectedFileTokensRef.current = selectedFileTokens;
    applyFileTokenHighlights(textareaRef.current, selectedFileTokens, fileTokenStyleRef.current);
  }, [selectedFileTokens]);

  const handleContentChange = () => {
    const input = textareaRef.current;
    const text = input?.plainText ?? "";
    const lineCount = text.split("\n").length;
    const nextRows = Math.min(Math.max(lineCount, minRows), maxRows);

    if (!replacingFileTokenRef.current && input && removeTouchedFileToken(input, text)) {
      return;
    }

    replacingFileTokenRef.current = false;
    commandSuggestions.setDraftText(text);
    fileSuggestions.setDraftText(text);
    fileSuggestions.setCursorOffset(input?.cursorOffset ?? text.length);
    const nextTokens = selectedFileTokensRef.current.filter((token) =>
      text.includes(token.displayText),
    );
    selectedFileTokensRef.current = nextTokens;
    setSelectedFileTokens(nextTokens);
    applyFileTokenHighlights(input, nextTokens, fileTokenStyleRef.current);
    previousTextRef.current = text;
    setRows(nextRows);
  };

  const handleCursorChange = () => {
    const input = textareaRef.current;
    const text = input?.plainText ?? "";
    fileSuggestions.setDraftText(text);
    fileSuggestions.setCursorOffset(input?.cursorOffset ?? text.length);
  };

  const handleKeyDown = (event: { name: string; preventDefault: () => void; stopPropagation: () => void }) => {
    if (event.name !== "backspace" && event.name !== "delete") {
      return;
    }

    const input = textareaRef.current;
    if (!input) {
      return;
    }

    const cursorOffset = input.cursorOffset;
    const touchedOffset = event.name === "backspace" ? cursorOffset - 1 : cursorOffset;
    const touchedRange = findFileTokenRangeAtOffset(
      input.plainText,
      selectedFileTokensRef.current,
      touchedOffset,
    );

    if (touchedRange === null) {
      return;
    }

    event.preventDefault();
    event.stopPropagation();
    removeFileTokenRange(input, touchedRange);
  };

  useKeyboard((event) => {
    if (event.eventType !== "press" && event.eventType !== "repeat") {
      return;
    }

    handleKeyDown(event);
  });

  const handleSubmit = () => {
    const input = textareaRef.current;
    const text = input?.plainText.trim() ?? "";

    if (!text) {
      return;
    }

    if (fileSuggestions.isVisible && fileSuggestions.selectedSuggestion) {
      insertSelectedFile(fileSuggestions.selectedSuggestion);
      return;
    }

    if (!commandSuggestions.runInputCommand(text)) {
      onSubmit(appendImageReferences(text, selectedFileTokens));
    }

    selectedFileTokensRef.current = [];
    previousTextRef.current = "";
    input?.clear();
    commandSuggestions.reset();
    fileSuggestions.reset();
    setSelectedFileTokens([]);
    imageCounterRef.current = 0;
    setRows(minRows);
  };

  const insertSelectedFile = (file: FileSuggestion) => {
    const input = textareaRef.current;
    const mentionQuery = fileSuggestions.mentionQuery;

    if (!input || mentionQuery === null) {
      return;
    }

    const text = input.plainText;
    const displayText = file.isImage
      ? `[Image${imageCounterRef.current + 1}]`
      : `@${file.path}`;
    const suffix = text.slice(mentionQuery.end);
    const insertionText = `${displayText}${suffix.startsWith(" ") ? "" : " "}`;
    const nextText = `${text.slice(0, mentionQuery.start)}${insertionText}${suffix}`;
    const nextCursorOffset = mentionQuery.start + insertionText.length;

    if (file.isImage) {
      imageCounterRef.current += 1;
    }

    const nextTokens = [
      ...selectedFileTokensRef.current.filter(
        (token) => token.displayText !== displayText,
      ),
      { displayText, path: file.path, isImage: file.isImage },
    ];

    selectedFileTokensRef.current = nextTokens;
    input.replaceText(nextText);
    input.cursorOffset = nextCursorOffset;
    fileSuggestions.setDraftText(nextText);
    fileSuggestions.setCursorOffset(nextCursorOffset);
    fileSuggestions.dismissDraftText(nextText);
    setSelectedFileTokens(nextTokens);
    previousTextRef.current = nextText;
    setRows(Math.min(Math.max(nextText.split("\n").length, minRows), maxRows));
    applyFileTokenHighlights(
      input,
      nextTokens,
      fileTokenStyleRef.current,
    );
  };

  const removeFileTokenRange = (
    input: TextareaRenderable,
    range: { start: number; end: number },
  ) => {
    const text = input.plainText;
    const nextText = `${text.slice(0, range.start)}${text.slice(range.end)}`;

    replacingFileTokenRef.current = true;
    input.replaceText(nextText);
    input.cursorOffset = range.start;
    commandSuggestions.setDraftText(nextText);
    fileSuggestions.setDraftText(nextText);
    fileSuggestions.setCursorOffset(range.start);
    const nextTokens = selectedFileTokensRef.current.filter((token) =>
      nextText.includes(token.displayText),
    );
    selectedFileTokensRef.current = nextTokens;
    setSelectedFileTokens(nextTokens);
    applyFileTokenHighlights(input, nextTokens, fileTokenStyleRef.current);
    previousTextRef.current = nextText;
    setRows(Math.min(Math.max(nextText.split("\n").length, minRows), maxRows));
  };

  const removeTouchedFileToken = (input: TextareaRenderable, text: string) => {
    const previousText = previousTextRef.current;
    const deletionRange = getDeletionRange(previousText, text);

    if (deletionRange === null) {
      previousTextRef.current = text;
      return false;
    }

    const touchedRange = findTouchedFileTokenRange(
      previousText,
      selectedFileTokensRef.current,
      deletionRange,
    );

    if (touchedRange === null) {
      previousTextRef.current = text;
      return false;
    }

    const nextText = `${previousText.slice(0, touchedRange.start)}${previousText.slice(touchedRange.end)}`;

    removeFileTokenRange(input, touchedRange);
    previousTextRef.current = nextText;

    return true;
  };

  return (
    <box position="relative" flexDirection="column" overflow="visible">
      {commandSuggestions.isVisible && (
        <box
          position="absolute"
          left={0}
          right={0}
          bottom={rows + 3}
          zIndex={100}
        >
          <CommandSuggestions
            commands={commandSuggestions.commands}
            onHighlight={commandSuggestions.setSelectedIndex}
            selectedIndex={commandSuggestions.selectedIndex}
          />
        </box>
      )}
      {!commandSuggestions.isVisible && fileSuggestions.isVisible && (
        <box
          position="absolute"
          left={0}
          right={0}
          bottom={rows + 3}
          zIndex={100}
        >
          <FileSuggestions
            files={fileSuggestions.suggestions}
            onHighlight={fileSuggestions.setSelectedIndex}
            selectedIndex={fileSuggestions.selectedIndex}
          />
        </box>
      )}
      <box
        height={rows + 3}
        border={["left"]}
        borderStyle="heavy"
        borderColor={modeColor}
        backgroundColor="#1E1E1E"
        padding={1}
      >
        <textarea
          ref={textareaRef}
          height={rows}
          focused
          wrapMode="word"
          placeholder="Ask shitcode..."
          placeholderColor="#475569"
          cursorColor="#facc15"
          syntaxStyle={fileTokenStyle?.style}
          keyBindings={submitKeyBindings}
          onCursorChange={handleCursorChange}
          onContentChange={handleContentChange}
          onKeyDown={handleKeyDown}
          onSubmit={handleSubmit}
          renderAfter={function (buffer) {
            renderSelectedFileTokenText(
              this as TextareaRenderable,
              buffer,
              selectedFileTokensRef.current,
            );
          }}
        />
        <ModeBar />
      </box>
    </box>
  );
}

function applyFileTokenHighlights(
  input: TextareaRenderable | null,
  tokens: SelectedFileToken[],
  style: { style: SyntaxStyle; styleId: number } | null,
) {
  if (!input || !style) {
    return;
  }

  input.syntaxStyle = style.style;
  input.extmarks.clear();
  input.clearAllHighlights();

  const text = input.plainText;
  for (const token of tokens) {
    let start = text.indexOf(token.displayText);

    while (start !== -1) {
      input.addHighlightByCharRange({
        start,
        end: start + token.displayText.length,
        styleId: style.styleId,
        priority: 255,
      });
      input.extmarks.create({
        start,
        end: start + token.displayText.length,
        virtual: true,
        styleId: style.styleId,
        priority: 255,
      });
      start = text.indexOf(token.displayText, start + token.displayText.length);
    }
  }

  input.requestRender();
}

function renderSelectedFileTokenText(
  input: TextareaRenderable,
  buffer: OptimizedBuffer,
  tokens: SelectedFileToken[],
) {
  const text = input.plainText;
  const fg = RGBA.fromHex("#facc15");
  const bg = input.backgroundColor;

  for (const token of tokens) {
    let start = text.indexOf(token.displayText);

    while (start !== -1) {
      const position = input.editBuffer.offsetToPosition(start);

      if (position !== null) {
        buffer.drawText(
          token.displayText,
          input.x + position.col,
          input.y + position.row,
          fg,
          bg,
        );
      }

      start = text.indexOf(
        token.displayText,
        start + token.displayText.length,
      );
    }
  }
}

function getDeletionRange(previousText: string, text: string) {
  if (text.length >= previousText.length) {
    return null;
  }

  let start = 0;
  while (
    start < text.length &&
    previousText[start] === text[start]
  ) {
    start += 1;
  }

  let previousEnd = previousText.length;
  let currentEnd = text.length;
  while (
    previousEnd > start &&
    currentEnd > start &&
    previousText[previousEnd - 1] === text[currentEnd - 1]
  ) {
    previousEnd -= 1;
    currentEnd -= 1;
  }

  return { start, end: previousEnd };
}

function findTouchedFileTokenRange(
  text: string,
  tokens: SelectedFileToken[],
  deletionRange: { start: number; end: number },
) {
  for (const token of tokens) {
    let start = text.indexOf(token.displayText);

    while (start !== -1) {
      const tokenEnd = start + token.displayText.length;

      if (rangesIntersect(deletionRange.start, deletionRange.end, start, tokenEnd)) {
        return { start, end: tokenEnd };
      }

      start = text.indexOf(token.displayText, tokenEnd);
    }
  }

  return null;
}

function findFileTokenRangeAtOffset(
  text: string,
  tokens: SelectedFileToken[],
  offset: number,
) {
  if (offset < 0) {
    return null;
  }

  for (const token of tokens) {
    let start = text.indexOf(token.displayText);

    while (start !== -1) {
      const tokenEnd = start + token.displayText.length;

      if (offset >= start && offset < tokenEnd) {
        return { start, end: tokenEnd };
      }

      start = text.indexOf(token.displayText, tokenEnd);
    }
  }

  return null;
}

function rangesIntersect(
  startA: number,
  endA: number,
  startB: number,
  endB: number,
) {
  return startA < endB && endA > startB;
}

function appendImageReferences(text: string, tokens: SelectedFileToken[]) {
  const imageTokens = tokens.filter(
    (token) => token.isImage && text.includes(token.displayText),
  );

  if (imageTokens.length === 0) {
    return text;
  }

  const references = imageTokens.map(
    (token) => `${token.displayText}: ${token.path}`,
  );

  return `${text}\n\nImage references:\n${references.join("\n")}`;
}
