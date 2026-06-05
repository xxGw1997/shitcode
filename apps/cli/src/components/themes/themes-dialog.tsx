import { useKeyboard } from "@opentui/react";
import type { ScrollBoxRenderable } from "@opentui/core";
import { useEffect, useMemo, useRef, useState } from "react";
import { useDialog } from "@/components/dialog";
import { themes, useThemeController, type ThemeName } from "@/lib/theme";

type ThemeOption = {
  name: ThemeName;
  label: string;
};

const themeOptions = Object.keys(themes).map((name) => ({
  name: name as ThemeName,
  label: formatThemeName(name),
})) satisfies ThemeOption[];

export function useThemesDialog() {
  const { openDialog, closeDialog } = useDialog();
  const { setPreviewThemeName } = useThemeController();

  return () => {
    openDialog({
      title: "themes",
      titleHint: "esc",
      width: 60,
      height: 16,
      body: <ThemesDialogBody onSelect={closeDialog} />,
      onClose: () => setPreviewThemeName(null),
    });
  };
}

type ThemesDialogBodyProps = {
  onSelect: () => void;
};

function ThemesDialogBody({ onSelect }: ThemesDialogBodyProps) {
  const { theme, themeName, setThemeName, setPreviewThemeName } = useThemeController();
  const scrollRef = useRef<ScrollBoxRenderable>(null);
  const [query, setQuery] = useState("");
  const filteredThemes = useMemo(
    () => filterThemes(themeOptions, query),
    [query],
  );
  const [selectedIndex, setSelectedIndex] = useState(() =>
    Math.max(
      themeOptions.findIndex((option) => option.name === themeName),
      0,
    ),
  );
  const selectedTheme = filteredThemes[selectedIndex];

  useEffect(() => {
    setSelectedIndex((index) => Math.min(index, Math.max(filteredThemes.length - 1, 0)));
  }, [filteredThemes.length]);

  useEffect(() => {
    setPreviewThemeName(selectedTheme?.name ?? null);
  }, [selectedTheme, setPreviewThemeName]);

  useEffect(() => {
    if (selectedTheme) {
      scrollRef.current?.scrollChildIntoView(selectedTheme.name);
    }
  }, [selectedTheme]);

  useKeyboard((event) => {
    if (event.eventType !== "press" && event.eventType !== "repeat") {
      return;
    }

    if (filteredThemes.length === 0) {
      return;
    }

    if (event.name === "up") {
      setSelectedIndex((index) =>
        index === 0 ? filteredThemes.length - 1 : index - 1,
      );
    }

    if (event.name === "down") {
      setSelectedIndex((index) => (index + 1) % filteredThemes.length);
    }

    if (event.name === "return" || event.name === "enter") {
      if (selectedTheme) {
        setThemeName(selectedTheme.name);
        onSelect();
      }
    }
  });

  return (
    <box flexDirection="column" gap={1} flexGrow={1} minHeight={0}>
      <box height={1} flexShrink={0}>
        <input
          value={query}
          onInput={setQuery}
          focused
          placeholder="Filter themes..."
          placeholderColor={theme.colors.textSubtle}
          cursorColor={theme.colors.primary}
          textColor={theme.colors.textStrong}
          backgroundColor={theme.colors.transparent}
          focusedBackgroundColor={theme.colors.transparent}
        />
      </box>

      <scrollbox
        ref={scrollRef}
        scrollY={true}
        scrollX={false}
        flexGrow={1}
        flexShrink={1}
        minHeight={0}
        contentOptions={{ flexDirection: "column" }}
      >
        {filteredThemes.length === 0 ? (
          <text fg={theme.colors.textMuted}>No matching themes</text>
        ) : filteredThemes.map((option, index) => {
          const selected = index === selectedIndex;
          const active = option.name === themeName;

          return (
            <box
              key={option.name}
              id={option.name}
              flexDirection="row"
              backgroundColor={selected ? theme.colors.primary : theme.colors.surface}
              paddingX={1}
              onMouseMove={() => setSelectedIndex(index)}
              onMouseDown={() => {
                setThemeName(option.name);
                onSelect();
              }}
            >
              <text width={2} fg={selected ? theme.colors.textInverse : theme.colors.accent}>
                {active ? "*" : " "}
              </text>
              <text flexGrow={1} fg={selected ? theme.colors.textInverse : theme.colors.textStrong}>
                {option.label}
              </text>
            </box>
          );
        })}
      </scrollbox>
    </box>
  );
}

function filterThemes(options: ThemeOption[], query: string) {
  const normalizedQuery = query.trim().toLowerCase();

  if (!normalizedQuery) {
    return options;
  }

  return options.filter((option) =>
    option.name.includes(normalizedQuery) ||
    option.label.toLowerCase().includes(normalizedQuery),
  );
}

function formatThemeName(name: string) {
  return name.replace(/(^|-)\w/g, (match) => match.toUpperCase());
}
