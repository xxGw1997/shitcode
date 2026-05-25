export const workspaceName = "shitcode-monorepo";

export const runtimeName = "bun";

export function createGreeting(target: string) {
  return `Hello from ${target} in ${workspaceName}`;
}
