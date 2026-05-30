import { readFile, stat } from "node:fs/promises";
import type { WorkspaceGuard } from "../../common/path-guard";
import { readFileInputSchema } from "./definition";

const MAX_READ_BYTES = 100_000;

function formatLines(text: string, offset: number, limit: number) {
  const lines = text.split("\n");
  const startIndex = offset - 1;
  const selected = lines.slice(startIndex, startIndex + limit);

  return {
    totalLines: lines.length,
    startLine: offset,
    endLine: startIndex + selected.length,
    content: selected
      .map((line, index) => `${startIndex + index + 1}: ${line}`)
      .join("\n"),
  };
}

export async function assertReadableTextFile(filePath: string) {
  const fileStat = await stat(filePath);

  if (!fileStat.isFile()) {
    throw new Error("Path is not a file");
  }

  if (fileStat.size > MAX_READ_BYTES) {
    throw new Error(`File is too large to read (${fileStat.size} bytes)`);
  }
}

export async function runReadFile(input: unknown, guard: WorkspaceGuard) {
  const { path: inputPath, offset = 1, limit = 200 } =
    readFileInputSchema.parse(input);
  const filePath = guard.resolveExisting(inputPath);
  await assertReadableTextFile(filePath);

  const text = await readFile(filePath, "utf8");

  return {
    path: guard.toRelative(filePath),
    ...formatLines(text, offset, limit),
  };
}
