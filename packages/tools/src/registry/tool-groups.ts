import type { Tool } from "ai";
import { deleteFileTool } from "../tools/delete-file/definition";
import { editFileTool } from "../tools/edit-file/definition";
import { getWorkspaceInfoTool } from "../tools/get-workspace-info/definition";
import { grepTool } from "../tools/grep/definition";
import { listFilesTool } from "../tools/list-files/definition";
import { readFileTool } from "../tools/read-file/definition";
import { runBashTool } from "../tools/run-bash/definition";
import { runPowerShellTool } from "../tools/run-powershell/definition";
import { writeFileTool } from "../tools/write-file/definition";

export const readOnlyTools = {
  get_workspace_info: getWorkspaceInfoTool,
  list_files: listFilesTool,
  read_file: readFileTool,
  grep: grepTool,
} as const satisfies Record<string, Tool>;

export const writeTools = {
  edit_file: editFileTool,
  write_file: writeFileTool,
  delete_file: deleteFileTool,
} as const satisfies Record<string, Tool>;

export const execTools = {
  run_bash: runBashTool,
  run_powershell: runPowerShellTool,
} as const satisfies Record<string, Tool>;

export const allTools = {
  ...readOnlyTools,
  ...writeTools,
  ...execTools,
} as const satisfies Record<string, Tool>;
