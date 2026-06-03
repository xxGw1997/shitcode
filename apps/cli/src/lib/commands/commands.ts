import type { NavigateFunction } from "react-router";
import { appRoutes } from "@/route/navigation";

export type CommandHandlerContext = {
  navigate: NavigateFunction;
  exit: () => void;
};

type CommandDefinition = {
  name: string;
  description: string;
  aliases?: string[];
  execute: (context: CommandHandlerContext) => void;
};

const commandPrefix = "/";

const commandDefinitions: CommandDefinition[] = [
  {
    name: "exit",
    description: "Close the CLI application",
    execute: ({ exit }) => exit(),
  },
  {
    name: "new",
    description: "Start from the home screen",
    execute: ({ navigate }) => navigate(appRoutes.home),
  }
];

export const chatCommands = commandDefinitions.map(({ name, description, aliases }) => ({
  name,
  description,
  aliases: aliases ?? [],
}));

const commandMap = new Map<string, CommandDefinition>();

for (const command of commandDefinitions) {
  commandMap.set(command.name, command);

  for (const alias of command.aliases ?? []) {
    commandMap.set(alias, command);
  }
}

export function runChatCommand(input: string, context: CommandHandlerContext) {
  const trimmedInput = input.trim();

  if (!trimmedInput.startsWith(commandPrefix)) {
    return false;
  }

  const [commandName = ""] = trimmedInput.slice(commandPrefix.length).split(/\s+/, 1);
  const command = commandMap.get(commandName);

  if (!command) {
    return false;
  }

  command.execute(context);
  return true;
}
