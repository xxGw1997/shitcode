import { deleteFileInputSchema } from "../tools/delete-file/definition";
import { editFileInputSchema } from "../tools/edit-file/definition";
import { getWorkspaceInfoInputSchema } from "../tools/get-workspace-info/definition";
import { grepInputSchema } from "../tools/grep/definition";
import { listFilesInputSchema } from "../tools/list-files/definition";
import { readFileInputSchema } from "../tools/read-file/definition";
import { runBashInputSchema } from "../tools/run-bash/definition";
import { runPowerShellInputSchema } from "../tools/run-powershell/definition";
import { writeFileInputSchema } from "../tools/write-file/definition";

export { deleteFileInputSchema } from "../tools/delete-file/definition";
export { editFileInputSchema } from "../tools/edit-file/definition";
export { getWorkspaceInfoInputSchema } from "../tools/get-workspace-info/definition";
export { grepInputSchema } from "../tools/grep/definition";
export { listFilesInputSchema } from "../tools/list-files/definition";
export { readFileInputSchema } from "../tools/read-file/definition";
export { runBashInputSchema } from "../tools/run-bash/definition";
export { runPowerShellInputSchema } from "../tools/run-powershell/definition";
export { writeFileInputSchema } from "../tools/write-file/definition";

export const toolInputSchemas = {
  get_workspace_info: getWorkspaceInfoInputSchema,
  list_files: listFilesInputSchema,
  read_file: readFileInputSchema,
  grep: grepInputSchema,
  edit_file: editFileInputSchema,
  write_file: writeFileInputSchema,
  delete_file: deleteFileInputSchema,
  run_bash: runBashInputSchema,
  run_powershell: runPowerShellInputSchema,
} as const;

export type ToolInputSchemas = typeof toolInputSchemas;
export type CodingAgentToolName = keyof ToolInputSchemas;
