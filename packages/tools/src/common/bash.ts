import { spawn } from "node:child_process";
import { createWorkspaceGuard } from "./path-guard";

const DEFAULT_TIMEOUT_MS = 30_000;
const MAX_OUTPUT_CHARS = 40_000;

const blockedCommandFragments = [
  "rm -rf /",
  "git reset --hard",
  "git checkout --",
  "git clean",
  "mkfs",
  "dd ",
  "shutdown",
  "reboot",
  "sudo",
  "chmod -R 777",
  "chown -R",
];

function truncate(value: string) {
  if (value.length <= MAX_OUTPUT_CHARS) {
    return value;
  }

  return `${value.slice(0, MAX_OUTPUT_CHARS)}\n[truncated after ${MAX_OUTPUT_CHARS} characters]`;
}

function assertCommandAllowed(command: string) {
  const normalized = command.replace(/\s+/g, " ").trim();
  const blocked = blockedCommandFragments.find((fragment) =>
    normalized.includes(fragment),
  );

  if (blocked) {
    throw new Error(`Refusing blocked command fragment: ${blocked}`);
  }
}

export async function runGuardedBash({
  workspaceRoot,
  command,
  cwd,
  timeoutMs = DEFAULT_TIMEOUT_MS,
}: {
  workspaceRoot: string;
  command: string;
  cwd?: string;
  timeoutMs?: number;
}) {
  assertCommandAllowed(command);

  const guard = createWorkspaceGuard(workspaceRoot);
  const commandCwd = cwd ? guard.resolveExisting(cwd) : guard.root;
  const timeout = Math.min(timeoutMs, 120_000);

  const child = spawn("bash", ["-lc", command], {
    cwd: commandCwd,
    env: {
      PATH: process.env.PATH ?? "",
      TERM: process.env.TERM ?? "xterm-256color",
      BUN_INSTALL: process.env.BUN_INSTALL ?? "",
      HOME: guard.root,
      CI: "1",
    },
  });

  let stdout = "";
  let stderr = "";
  let timedOut = false;

  child.stdout.setEncoding("utf8");
  child.stderr.setEncoding("utf8");
  child.stdout.on("data", (chunk: string) => {
    stdout += chunk;
  });
  child.stderr.on("data", (chunk: string) => {
    stderr += chunk;
  });

  const timer = setTimeout(() => {
    timedOut = true;
    child.kill();
  }, timeout);

  const exitCode = await new Promise<number | null>((resolve, reject) => {
    child.on("error", reject);
    child.on("close", (code) => resolve(code));
  }).finally(() => clearTimeout(timer));

  return {
    command,
    cwd: guard.toRelative(commandCwd),
    exitCode,
    stdout: truncate(stdout),
    stderr: truncate(stderr),
    timedOut,
  };
}
