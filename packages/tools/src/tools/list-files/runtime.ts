import { readdir, stat } from "node:fs/promises";
import path from "node:path";
import type { WorkspaceGuard } from "../../common/path-guard";
import { listFilesInputSchema } from "./definition";

const MAX_LIST_ENTRIES = 500;
const SKIPPED_DIRS = new Set([
  ".git",
  "node_modules",
  "dist",
  "build",
  ".next",
  ".turbo",
]);

export async function runListFiles(input: unknown, guard: WorkspaceGuard) {
  const { path: inputPath = ".", depth = 3 } = listFilesInputSchema.parse(input);
  const rootPath = guard.resolveExisting(inputPath);
  const rootStat = await stat(rootPath);

  if (!rootStat.isDirectory()) {
    throw new Error("Path is not a directory");
  }

  const entries: Array<{ path: string; type: "file" | "directory" }> = [];

  async function walk(directory: string, currentDepth: number) {
    if (currentDepth > depth || entries.length >= MAX_LIST_ENTRIES) {
      return;
    }

    for (const entry of await readdir(directory, { withFileTypes: true })) {
      if (entries.length >= MAX_LIST_ENTRIES) {
        break;
      }

      if (entry.isDirectory() && SKIPPED_DIRS.has(entry.name)) {
        continue;
      }

      const absolute = path.join(directory, entry.name);
      const relative = guard.toRelative(absolute);

      if (entry.isDirectory()) {
        entries.push({ path: relative, type: "directory" });
        await walk(absolute, currentDepth + 1);
        continue;
      }

      if (entry.isFile()) {
        entries.push({ path: relative, type: "file" });
      }
    }
  }

  await walk(rootPath, 1);

  return {
    path: guard.toRelative(rootPath),
    entries,
    truncated: entries.length >= MAX_LIST_ENTRIES,
  };
}
