import type { WorkspaceGuard } from "../../common/path-guard";
import { runGuardedPowerShell } from "../../common/powershell";
import { runPowerShellInputSchema } from "./definition";

export async function runPowerShellToolRuntime(
  input: unknown,
  guard: WorkspaceGuard,
) {
  const args = runPowerShellInputSchema.parse(input);
  return runGuardedPowerShell({ workspaceRoot: guard.root, ...args });
}
