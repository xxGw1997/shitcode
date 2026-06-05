import { readdirSync, statSync } from "node:fs";
import { join, relative } from "node:path";

export type FileSuggestion = {
  path: string;
  name: string;
  isImage: boolean;
};

export type FileMentionQuery = {
  query: string;
  start: number;
  end: number;
};

const excludedDirectories = new Set([
  ".cache",
  ".git",
  ".next",
  ".turbo",
  "build",
  "dist",
  "node_modules",
]);
const imageExtensions = new Set([
  ".avif",
  ".bmp",
  ".gif",
  ".ico",
  ".jpeg",
  ".jpg",
  ".png",
  ".svg",
  ".webp",
]);
const maxIndexedFiles = 5000;

export function listWorkspaceFiles(root = process.cwd()): FileSuggestion[] {
  const files: FileSuggestion[] = [];

  walkDirectory(root, root, files);

  return files.sort((a, b) => a.path.localeCompare(b.path));
}

export function filterFileSuggestions(
  files: FileSuggestion[],
  query: string,
  limit = 10,
) {
  const normalizedQuery = normalizeQuery(query);

  if (!normalizedQuery) {
    return files.slice(0, limit);
  }

  return files
    .map((file) => ({ file, score: scoreFile(file, normalizedQuery) }))
    .filter((entry) => entry.score >= 0)
    .sort((a, b) => a.score - b.score || a.file.path.localeCompare(b.file.path))
    .slice(0, limit)
    .map((entry) => entry.file);
}

export function getFileMentionQuery(
  text: string,
  cursorOffset = text.length,
): FileMentionQuery | null {
  const end = Math.min(Math.max(cursorOffset, 0), text.length);
  const segment = text.slice(0, end);
  const atIndex = segment.lastIndexOf("@");

  if (atIndex === -1) {
    return null;
  }

  const before = text[atIndex - 1];
  const after = text[atIndex + 1];

  if ((before != null && /\s/.test(before)) || (after != null && /\s/.test(after))) {
    return null;
  }

  const query = text.slice(atIndex + 1, end);

  if (/\s/.test(query)) {
    return null;
  }

  return { query, start: atIndex, end };
}

export function isImagePath(path: string) {
  const dotIndex = path.lastIndexOf(".");

  if (dotIndex === -1) {
    return false;
  }

  return imageExtensions.has(path.slice(dotIndex).toLowerCase());
}

function walkDirectory(root: string, directory: string, files: FileSuggestion[]) {
  if (files.length >= maxIndexedFiles) {
    return;
  }

  let entries: string[];
  try {
    entries = readdirSync(directory);
  } catch {
    return;
  }

  for (const entry of entries) {
    if (files.length >= maxIndexedFiles) {
      return;
    }

    if (excludedDirectories.has(entry)) {
      continue;
    }

    const absolutePath = join(directory, entry);
    let stat;
    try {
      stat = statSync(absolutePath);
    } catch {
      continue;
    }

    if (stat.isDirectory()) {
      walkDirectory(root, absolutePath, files);
      continue;
    }

    if (!stat.isFile()) {
      continue;
    }

    const path = normalizePath(relative(root, absolutePath));
    files.push({ path, name: entry, isImage: isImagePath(path) });
  }
}

function normalizePath(path: string) {
  return path.replace(/\\/g, "/");
}

function normalizeQuery(query: string) {
  return query.toLowerCase().replace(/\\/g, "/");
}

function scoreFile(file: FileSuggestion, query: string) {
  const path = file.path.toLowerCase();
  const name = file.name.toLowerCase();
  const pathIndex = path.indexOf(query);

  if (pathIndex === -1) {
    return -1;
  }

  const nameIndex = name.indexOf(query);
  const startsWithPath = path.startsWith(query) ? 0 : 20;
  const startsWithName = name.startsWith(query) ? 0 : 10;
  const nameBonus = nameIndex >= 0 ? startsWithName : 30;

  return startsWithPath + nameBonus + pathIndex + file.path.length / 1000;
}
