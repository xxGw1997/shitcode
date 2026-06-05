import type { FileSuggestion } from "@/lib/files/file-suggestions";

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
  if (files.length === 0) {
    return (
      <box
        width="100%"
        flexDirection="column"
        border={["left"]}
        borderStyle="heavy"
        borderColor="#475569"
        backgroundColor="#1E1E1E"
        paddingLeft={1}
      >
        <text fg="#94a3b8">No matching files</text>
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
      borderColor="#475569"
      backgroundColor="#1E1E1E"
      paddingLeft={1}
    >
      {visibleFiles.map((file, index) => {
        const fileIndex = visibleStartIndex + index;
        const selected = fileIndex === selectedIndex;

        return (
          <box
            key={file.path}
            flexDirection="row"
            backgroundColor={selected ? "#fab283" : "#1E1E1E"}
            onMouseMove={() => onHighlight(fileIndex)}
            onMouseOver={() => onHighlight(fileIndex)}
          >
            <text width={filePathWidth} fg={selected ? "#1E1E1E" : "#e2e8f0"}>
              {file.path}
            </text>
            <text fg={selected ? "#1E1E1E" : "#94a3b8"}>
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
