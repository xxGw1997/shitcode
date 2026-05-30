import type { WorkspaceGuard } from "../../common/path-guard";
import { getWorkspaceInfoInputSchema } from "./definition";

export function runGetWorkspaceInfo(input: unknown, guard: WorkspaceGuard) {
  getWorkspaceInfoInputSchema.parse(input);

  return {
    root: guard.root,
    note: "All local tools are restricted to this CLI workspace root.",
  };
}
