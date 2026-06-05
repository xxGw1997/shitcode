import type { FileSuggestion } from "@/lib/files/file-suggestions";
import { useTheme } from "@/lib/theme";

type FileSuggestionsProps = {
  files: FileSuggestion[];
  onHighlight: (index: number) => void;
  selectedIndex: number;
};

const maxVisibleFiles = 10;
const fileTypeGap = 3;

export function FileSuggestions({
  files,
  onHighlight,
  selectedIndex,
}: FileSuggestionsProps) {
  const theme = useTheme();

  if (files.length === 0) {
    return (
      <box
        width="100%"
        flexDirection="column"
        border={["left"]}
        borderStyle="heavy"
        borderColor={theme.colors.border}
        backgroundColor={theme.colors.surface}
        paddingLeft={1}
      >
        <text fg={theme.colors.textMuted}>No matching files</text>
      </box>
    );
  }

  const visibleStartIndex = getVisibleStartIndex(files.length, selectedIndex);
  const visibleFiles = files.slice(
    visibleStartIndex,
    visibleStartIndex + maxVisibleFiles,
  );
  const filePathWidth = getFilePathWidth(files);

  return (
    <box
      width="100%"
      flexDirection="column"
      border={["left"]}
      borderStyle="heavy"
      borderColor={theme.colors.border}
      backgroundColor={theme.colors.surface}
      paddingLeft={1}
    >
      {visibleFiles.map((file, index) => {
        const fileIndex = visibleStartIndex + index;
        const selected = fileIndex === selectedIndex;

        return (
          <box
            key={file.path}
            flexDirection="row"
            backgroundColor={selected ? theme.colors.accent : theme.colors.surface}
            onMouseMove={() => onHighlight(fileIndex)}
            onMouseOver={() => onHighlight(fileIndex)}
          >
            <text width={filePathWidth} fg={selected ? theme.colors.textInverse : theme.colors.textStrong}>
              {file.path}
            </text>
            <text fg={selected ? theme.colors.textInverse : theme.colors.textMuted}>
              {file.isImage ? "image" : "file"}
            </text>
          </box>
        );
      })}
    </box>
  );
}

function getFilePathWidth(files: FileSuggestion[]) {
  const longestFilePath = Math.max(...files.map((file) => file.path.length));

  return longestFilePath + fileTypeGap;
}

function getVisibleStartIndex(fileCount: number, selectedIndex: number) {
  if (fileCount <= maxVisibleFiles) {
    return 0;
  }

  const maxStartIndex = fileCount - maxVisibleFiles;

  return Math.min(
    Math.max(selectedIndex - maxVisibleFiles + 1, 0),
    maxStartIndex,
  );
}
