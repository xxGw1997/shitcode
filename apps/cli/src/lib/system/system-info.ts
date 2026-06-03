import os from "node:os";

export type HostContext = {
  platform: string;
  arch: string;
  release: string;
  hostname: string;
  homedir: string;
  defaultShell: string;
  nodeVersion: string;
  bunVersion: string;
  cwd: string;
};

function detectDefaultShell(): string {
  if (process.platform === "win32") {
    return process.env.ComSpec ?? "cmd.exe";
  }
  return process.env.SHELL ?? "/bin/sh";
}

export function collectHostContext(): HostContext {
  return {
    platform: process.platform,
    arch: process.arch,
    release: os.release(),
    hostname: os.hostname(),
    homedir: os.homedir(),
    defaultShell: detectDefaultShell(),
    nodeVersion: process.version,
    bunVersion: Bun.version,
    cwd: process.cwd(),
  };
}
