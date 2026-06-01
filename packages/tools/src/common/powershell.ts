import { spawn } from "node:child_process";
import { createWorkspaceGuard } from "./path-guard";

const DEFAULT_TIMEOUT_MS = 30_000;
const MAX_OUTPUT_CHARS = 40_000;

const sharedBlockedCommandFragments = [
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

const powershellBlockedCommandFragments = [
  "format-volume",
  "clear-disk",
  "initialize-disk",
  "stop-computer",
  "restart-computer",
  "set-executionpolicy bypass",
  "invoke-expression",
];

const powershellDriveRootDeletePattern = /remove-item\s+(-recurse|-r)\s+(-force|-f)\s+[a-z]:\\/i;

type ResolvedShell = {
  binary: string;
  resolved: "pwsh" | "powershell";
};

function truncate(value: string) {
  if (value.length <= MAX_OUTPUT_CHARS) {
    return value;
  }

  return `${value.slice(0, MAX_OUTPUT_CHARS)}\n[truncated after ${MAX_OUTPUT_CHARS} characters]`;
}

function assertCommandAllowed(command: string) {
  const normalized = command.replace(/\s+/g, " ").trim();
  const lower = normalized.toLowerCase();

  const blocked = [
    ...sharedBlockedCommandFragments,
    ...powershellBlockedCommandFragments,
  ].find((fragment) => lower.includes(fragment));

  if (blocked) {
    throw new Error(`Refusing blocked command fragment: ${blocked}`);
  }

  if (powershellDriveRootDeletePattern.test(command)) {
    throw new Error(
      "Refusing Remove-Item -Recurse -Force targeting a drive root.",
    );
  }
}

async function findBinary(candidates: string[]): Promise<string | null> {
  for (const candidate of candidates) {
    const found = await Bun.which(candidate);
    if (found) {
      return found;
    }
  }
  return null;
}

async function resolveShell(shell: "auto" | "pwsh" | "powershell"): Promise<ResolvedShell> {
  if (shell === "pwsh") {
    const found = await findBinary(["pwsh"]);
    if (!found) {
      throw new Error("PowerShell Core (pwsh) was not found on PATH.");
    }
    return { binary: found, resolved: "pwsh" };
  }

  if (shell === "powershell") {
    const found = await findBinary(["powershell.exe", "powershell"]);
    if (!found) {
      throw new Error("Windows PowerShell (powershell.exe) was not found on PATH.");
    }
    return { binary: found, resolved: "powershell" };
  }

  const envOverride = Bun.env.POWERSHELL_BIN;
  if (envOverride) {
    return { binary: envOverride, resolved: "pwsh" };
  }

  const pwsh = await findBinary(["pwsh"]);
  if (pwsh) {
    return { binary: pwsh, resolved: "pwsh" };
  }

  const windowsPs = await findBinary(["powershell.exe", "powershell"]);
  if (windowsPs) {
    return { binary: windowsPs, resolved: "powershell" };
  }

  throw new Error(
    "No PowerShell binary available. Install PowerShell Core (pwsh) or run on Windows with powershell.exe on PATH.",
  );
}

export async function runGuardedPowerShell({
  workspaceRoot,
  command,
  cwd,
  timeoutMs = DEFAULT_TIMEOUT_MS,
  shell = "auto",
}: {
  workspaceRoot: string;
  command: string;
  cwd?: string;
  timeoutMs?: number;
  shell?: "auto" | "pwsh" | "powershell";
}) {
  assertCommandAllowed(command);

  const guard = createWorkspaceGuard(workspaceRoot);
  const commandCwd = cwd ? guard.resolveExisting(cwd) : guard.root;
  const timeout = Math.min(timeoutMs, 120_000);

  const { binary, resolved } = await resolveShell(shell);

  const child = spawn(binary, ["-NoProfile", "-NonInteractive", "-Command", command], {
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
    shell: resolved,
    shellBinary: binary,
    exitCode,
    stdout: truncate(stdout),
    stderr: truncate(stderr),
    timedOut,
  };
}
