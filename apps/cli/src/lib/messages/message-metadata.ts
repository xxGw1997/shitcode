import {
  messageModeValues,
  type MessageMode,
  type UserMessageMetadata,
} from "@shitcode/database/schema";

type MessageModeSource = {
  label: string;
};

export type { MessageMode, UserMessageMetadata };

function isMessageMode(label: string): label is MessageMode {
  return messageModeValues.includes(label as MessageMode);
}

export function toMessageMode(label: string): MessageMode {
  return isMessageMode(label) ? label : "Build";
}

export function createUserMessageMetadata(
  mode: MessageModeSource,
): UserMessageMetadata {
  return {
    mode: toMessageMode(mode.label),
  };
}
