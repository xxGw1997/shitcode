import {
  existsSync,
  realpathSync,
  statSync,
} from "node:fs";
import path from "node:path";

export type WorkspaceGuard = ReturnType<typeof createWorkspaceGuard>;

function isInside(root: string, candidate: string) {
  return candidate === root || candidate.startsWith(`${root}${path.sep}`);
}

function resolveInput(root: string, inputPath = ".") {
  return path.resolve(root, inputPath);
}

export function createWorkspaceGuard(workspaceRoot: string) {
  const root = realpathSync(workspaceRoot);

  function assertInside(candidate: string) {
    if (!isInside(root, candidate)) {
      throw new Error(`Path escapes workspace root: ${candidate}`);
    }
  }

  function resolveExisting(inputPath = ".") {
    const resolved = realpathSync(resolveInput(root, inputPath));
    assertInside(resolved);
    return resolved;
  }

  function resolveTarget(inputPath: string) {
    const resolved = resolveInput(root, inputPath);

    if (existsSync(resolved)) {
      return resolveExisting(inputPath);
    }

    const parent = realpathSync(path.dirname(resolved));
    assertInside(parent);
    assertInside(resolved);
    return resolved;
  }

  function statExisting(inputPath = ".") {
    const resolved = resolveExisting(inputPath);
    return { path: resolved, stat: statSync(resolved) };
  }

  function toRelative(absolutePath: string) {
    const relative = path.relative(root, absolutePath);
    return relative === "" ? "." : relative;
  }

  return {
    root,
    resolveExisting,
    resolveTarget,
    statExisting,
    toRelative,
  };
}
