import { useKeyboard } from "@opentui/react";
import { useEffect, useMemo, useState } from "react";
import {
  filterFileSuggestions,
  getFileMentionQuery,
  listWorkspaceFiles,
  type FileMentionQuery,
  type FileSuggestion,
} from "./file-suggestions";

type UseFileSuggestionsOptions = {
  enabled?: boolean;
};

export function useFileSuggestions({ enabled = true }: UseFileSuggestionsOptions = {}) {
  const [draftText, setDraftText] = useState("");
  const [dismissedDraftText, setDismissedDraftText] = useState<string | null>(null);
  const [cursorOffset, setCursorOffset] = useState(0);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [files, setFiles] = useState<FileSuggestion[]>([]);
  const mentionQuery = enabled
    ? getFileMentionQuery(draftText, cursorOffset)
    : null;
  const suggestions = useMemo(() => {
    if (mentionQuery === null) {
      return [];
    }

    return filterFileSuggestions(files, mentionQuery.query);
  }, [files, mentionQuery]);
  const isVisible = mentionQuery !== null && dismissedDraftText !== draftText;

  useEffect(() => {
    setFiles(listWorkspaceFiles());
  }, []);

  useEffect(() => {
    setSelectedIndex(0);
  }, [mentionQuery?.query]);

  useEffect(() => {
    if (selectedIndex >= suggestions.length) {
      setSelectedIndex(Math.max(suggestions.length - 1, 0));
    }
  }, [selectedIndex, suggestions.length]);

  useKeyboard((event) => {
    if (event.eventType !== "press" && event.eventType !== "repeat") {
      return;
    }

    if (mentionQuery !== null && event.name === "escape") {
      setDismissedDraftText(draftText);
      setSelectedIndex(0);
      return;
    }

    if (!isVisible || suggestions.length === 0) {
      return;
    }

    if (event.name === "up") {
      setSelectedIndex((index) =>
        index === 0 ? suggestions.length - 1 : index - 1,
      );
    }

    if (event.name === "down") {
      setSelectedIndex((index) => (index + 1) % suggestions.length);
    }
  });

  return {
    isVisible,
    mentionQuery,
    reset: () => {
      setDismissedDraftText(null);
      setDraftText("");
      setCursorOffset(0);
      setSelectedIndex(0);
    },
    dismissDraftText: (text: string) => {
      setDismissedDraftText(text);
      setSelectedIndex(0);
    },
    selectedIndex,
    selectedSuggestion: isVisible ? suggestions[selectedIndex] : undefined,
    setDraftText,
    setCursorOffset,
    setSelectedIndex,
    suggestions,
  } satisfies {
    isVisible: boolean;
    mentionQuery: FileMentionQuery | null;
    reset: () => void;
    dismissDraftText: (text: string) => void;
    selectedIndex: number;
    selectedSuggestion: FileSuggestion | undefined;
    setDraftText: (text: string) => void;
    setCursorOffset: (offset: number) => void;
    setSelectedIndex: (index: number) => void;
    suggestions: FileSuggestion[];
  };
}
