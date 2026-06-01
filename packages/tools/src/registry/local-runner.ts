import { createWorkspaceGuard } from "../common/path-guard";
import type { CodingAgentToolName } from "./schemas";
import type { Mode } from "./modes";
import { runDeleteFile } from "../tools/delete-file/runtime";
import { runEditFile } from "../tools/edit-file/runtime";
import { runGetWorkspaceInfo } from "../tools/get-workspace-info/runtime";
import { runGrep } from "../tools/grep/runtime";
import { runListFiles } from "../tools/list-files/runtime";
import { runReadFile } from "../tools/read-file/runtime";
import { runBashToolRuntime } from "../tools/run-bash/runtime";
import { runPowerShellToolRuntime } from "../tools/run-powershell/runtime";
import { runWriteFile } from "../tools/write-file/runtime";

type LocalToolRunnerOptions = {
  workspaceRoot: string;
  mode: Mode;
};

export function createLocalToolRunner({ workspaceRoot, mode }: LocalToolRunnerOptions) {
  const guard = createWorkspaceGuard(workspaceRoot);
  const allowed = new Set<CodingAgentToolName>(
    Object.keys(mode.tools) as CodingAgentToolName[],
  );

  async function run(toolName: string, input: unknown) {
    const resolved = toolName as CodingAgentToolName;

    if (!allowed.has(resolved)) {
      throw new Error(
        `Tool "${toolName}" is not available in mode "${mode.id}". ` +
          `Allowed: ${[...allowed].join(", ")}`,
      );
    }

    switch (resolved) {
      case "get_workspace_info":
        return runGetWorkspaceInfo(input, guard);
      case "list_files":
        return runListFiles(input, guard);
      case "read_file":
        return runReadFile(input, guard);
      case "grep":
        return runGrep(input, guard);
      case "edit_file":
        return runEditFile(input, guard);
      case "write_file":
        return runWriteFile(input, guard);
      case "delete_file":
        return runDeleteFile(input, guard);
      case "run_bash":
        return runBashToolRuntime(input, guard);
      case "run_powershell":
        return runPowerShellToolRuntime(input, guard);
      default:
        throw new Error(`Unknown tool: ${toolName}`);
    }
  }

  return {
    workspaceRoot: guard.root,
    mode,
    run,
  };
}
