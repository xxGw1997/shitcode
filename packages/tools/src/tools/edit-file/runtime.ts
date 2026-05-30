import { readFile, writeFile } from "node:fs/promises";
import type { WorkspaceGuard } from "../../common/path-guard";
import { assertReadableTextFile } from "../read-file/runtime";
import { editFileInputSchema } from "./definition";

export async function runEditFile(input: unknown, guard: WorkspaceGuard) {
  const { path: inputPath, oldText, newText } = editFileInputSchema.parse(input);
  const filePath = guard.resolveExisting(inputPath);
  await assertReadableTextFile(filePath);

  const text = await readFile(filePath, "utf8");
  const firstIndex = text.indexOf(oldText);

  if (firstIndex === -1) {
    throw new Error("oldText was not found");
  }

  if (text.indexOf(oldText, firstIndex + oldText.length) !== -1) {
    throw new Error("oldText appears multiple times; provide a unique match");
  }

  const updated = `${text.slice(0, firstIndex)}${newText}${text.slice(
    firstIndex + oldText.length,
  )}`;
  await writeFile(filePath, updated, "utf8");

  return {
    path: guard.toRelative(filePath),
    bytesWritten: Buffer.byteLength(updated, "utf8"),
  };
}
