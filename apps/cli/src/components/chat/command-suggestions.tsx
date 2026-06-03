import type { chatCommands } from "@/lib/commands/commands";

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
  if (commands.length === 0) {
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
        <text fg="#94a3b8">
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
      borderColor="#475569"
      backgroundColor="#1E1E1E"
      paddingLeft={1}
    >
      {visibleCommands.map((command, index) => {
        const commandIndex = visibleStartIndex + index;
        const selected = commandIndex === selectedIndex;

        return (
          <box
            key={command.name}
            flexDirection="row"
            backgroundColor={selected ? "#fab283" : "#1E1E1E"}
            onMouseMove={() => onHighlight(commandIndex)}
            onMouseOver={() => onHighlight(commandIndex)}
          >
            <text width={commandNameWidth} fg={selected ? "#1E1E1E" : "#e2e8f0"}>
              /{command.name}
            </text>
            <text fg={selected ? "#1E1E1E" : "#94a3b8"}>{command.description}</text>
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
