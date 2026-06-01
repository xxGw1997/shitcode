import { codingAgentSystemPrompt } from "@shitcode/tools";
import { collectHostContext, type HostContext } from "./system-info";

function buildHostContextBlock(host: HostContext): string {
  return [
    "## Host machine (user's local CLI computer)",
    `- platform: ${host.platform}`,
    `- arch: ${host.arch}`,
    `- release: ${host.release}`,
    `- hostname: ${host.hostname}`,
    `- homedir: ${host.homedir}`,
    `- defaultShell: ${host.defaultShell}`,
    `- nodeVersion: ${host.nodeVersion}`,
    `- bunVersion: ${host.bunVersion}`,
    `- cwd: ${host.cwd}`,
    "Use run_powershell on Windows, run_bash on macOS/Linux. Override the shell only when the user explicitly asks.",
  ].join("\n");
}

export function composeSystemPrompt(): string {
  return `${codingAgentSystemPrompt}\n\n${buildHostContextBlock(collectHostContext())}`;
}
