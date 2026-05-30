import { readdir, readFile, stat } from "node:fs/promises";
import path from "node:path";
import type { WorkspaceGuard } from "../../common/path-guard";
import { grepInputSchema } from "./definition";

const MAX_READ_BYTES = 100_000;
const MAX_GREP_MATCHES = 100;
const SKIPPED_DIRS = new Set([
  ".git",
  "node_modules",
  "dist",
  "build",
  ".next",
  ".turbo",
]);

function wildcardToRegExp(pattern: string) {
  const escaped = pattern.replace(/[.+^${}()|[\]\\]/g, "\\$&");
  return new RegExp(`^${escaped.replace(/\*/g, ".*")}$`);
}

function matchesInclude(relativePath: string, include?: string) {
  if (!include) {
    return true;
  }

  return wildcardToRegExp(include).test(path.basename(relativePath));
}

export async function runGrep(input: unknown, guard: WorkspaceGuard) {
  const { query, path: inputPath = ".", include, regex = false } =
    grepInputSchema.parse(input);
  const searchRoot = guard.resolveExisting(inputPath);
  const searchStat = await stat(searchRoot);
  const matcher = regex
    ? new RegExp(query)
    : { test: (value: string) => value.includes(query) };
  const matches: Array<{ path: string; line: number; text: string }> = [];

  async function searchFile(filePath: string) {
    const relative = guard.toRelative(filePath);

    if (!matchesInclude(relative, include)) {
      return;
    }

    const fileStat = await stat(filePath);
    if (!fileStat.isFile() || fileStat.size > MAX_READ_BYTES) {
      return;
    }

    const text = await readFile(filePath, "utf8");
    const lines = text.split("\n");

    for (let index = 0; index < lines.length; index += 1) {
      if (matches.length >= MAX_GREP_MATCHES) {
        return;
      }

      if (matcher.test(lines[index] ?? "")) {
        matches.push({
          path: relative,
          line: index + 1,
          text: lines[index] ?? "",
        });
      }
    }
  }

  async function walk(directory: string) {
    if (matches.length >= MAX_GREP_MATCHES) {
      return;
    }

    for (const entry of await readdir(directory, { withFileTypes: true })) {
      if (matches.length >= MAX_GREP_MATCHES) {
        break;
      }

      if (entry.isDirectory() && SKIPPED_DIRS.has(entry.name)) {
        continue;
      }

      const absolute = path.join(directory, entry.name);

      if (entry.isDirectory()) {
        await walk(absolute);
        continue;
      }

      if (entry.isFile()) {
        await searchFile(absolute);
      }
    }
  }

  if (searchStat.isFile()) {
    await searchFile(searchRoot);
  } else if (searchStat.isDirectory()) {
    await walk(searchRoot);
  } else {
    throw new Error("Path is not searchable");
  }

  return {
    matches,
    truncated: matches.length >= MAX_GREP_MATCHES,
  };
}
