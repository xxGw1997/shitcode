import { writeFile } from "node:fs/promises";
import type { WorkspaceGuard } from "../../common/path-guard";
import { writeFileInputSchema } from "./definition";

export async function runWriteFile(input: unknown, guard: WorkspaceGuard) {
  const { path: inputPath, content } = writeFileInputSchema.parse(input);
  const filePath = guard.resolveTarget(inputPath);
  await writeFile(filePath, content, "utf8");

  return {
    path: guard.toRelative(filePath),
    bytesWritten: Buffer.byteLength(content, "utf8"),
  };
}
