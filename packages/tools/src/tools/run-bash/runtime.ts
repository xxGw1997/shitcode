import type { WorkspaceGuard } from "../../common/path-guard";
import { runGuardedBash } from "../../common/bash";
import { runBashInputSchema } from "./definition";

export async function runBashToolRuntime(input: unknown, guard: WorkspaceGuard) {
  const args = runBashInputSchema.parse(input);
  return runGuardedBash({ workspaceRoot: guard.root, ...args });
}
