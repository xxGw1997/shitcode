import { rm, stat } from "node:fs/promises";
import type { WorkspaceGuard } from "../../common/path-guard";
import { deleteFileInputSchema } from "./definition";

export async function runDeleteFile(input: unknown, guard: WorkspaceGuard) {
  const { path: inputPath } = deleteFileInputSchema.parse(input);
  const filePath = guard.resolveExisting(inputPath);
  const fileStat = await stat(filePath);

  if (!fileStat.isFile()) {
    throw new Error("Refusing to delete a non-file path");
  }

  await rm(filePath);

  return {
    path: guard.toRelative(filePath),
    deleted: true,
  };
}
