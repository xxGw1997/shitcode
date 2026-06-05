import type { chatCommands } from "@/lib/commands/commands";
import { useTheme } from "@/lib/theme";

type CommandSuggestion = (typeof chatCommands)[number];

type CommandSuggestionsProps = {
  commands: CommandSuggestion[];
  onHighlight: (index: number) => void;
  selectedIndex: number;
};

const maxVisibleCommands = 10;
const commandDescriptionGap = 4;

export function CommandSuggestions({
  commands,
  onHighlight,
  selectedIndex,
}: CommandSuggestionsProps) {
  const theme = useTheme();

  if (commands.length === 0) {
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
        <text fg={theme.colors.textMuted}>
          No matching commands
        </text>
      </box>
    );
  }

  const visibleStartIndex = getVisibleStartIndex(commands.length, selectedIndex);
  const visibleCommands = commands.slice(
    visibleStartIndex,
    visibleStartIndex + maxVisibleCommands,
  );
  const commandNameWidth = getCommandNameWidth(commands);

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
      {visibleCommands.map((command, index) => {
        const commandIndex = visibleStartIndex + index;
        const selected = commandIndex === selectedIndex;

        return (
          <box
            key={command.name}
            flexDirection="row"
            backgroundColor={selected ? theme.colors.accent : theme.colors.surface}
            onMouseMove={() => onHighlight(commandIndex)}
            onMouseOver={() => onHighlight(commandIndex)}
          >
            <text width={commandNameWidth} fg={selected ? theme.colors.textInverse : theme.colors.textStrong}>
              /{command.name}
            </text>
            <text fg={selected ? theme.colors.textInverse : theme.colors.textMuted}>{command.description}</text>
          </box>
        );
      })}
    </box>
  );
}

function getCommandNameWidth(commands: CommandSuggestion[]) {
  const longestCommandName = Math.max(
    ...commands.map((command) => command.name.length),
  );

  return longestCommandName + 1 + commandDescriptionGap;
}

function getVisibleStartIndex(commandCount: number, selectedIndex: number) {
  if (commandCount <= maxVisibleCommands) {
    return 0;
  }

  const maxStartIndex = commandCount - maxVisibleCommands;

  return Math.min(
    Math.max(selectedIndex - maxVisibleCommands + 1, 0),
    maxStartIndex,
  );
}
