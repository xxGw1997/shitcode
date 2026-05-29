# Repository Guidelines

## Project Layout

This is a Bun workspace monorepo.

- `apps/cli`: OpenTUI React terminal app. Entry point: `apps/cli/src/index.tsx`.
- `apps/server`: Hono HTTP server for Bun. Entry point: `apps/server/src/index.ts`.
- `packages`: reserved for shared workspace packages.
- Root `tsconfig.json`: shared strict TypeScript settings.
- Root `bunfig.toml`: Bun package-manager configuration.

## Common Commands

Run commands from the repository root unless a task specifically needs an app directory.

- `bun install`: install workspace dependencies and update `bun.lock`.
- `bun run dev:server`: run the Hono server with hot reload.
- `bun run start:server`: run the Hono server normally.
- `bun run dev:cli`: run the OpenTUI CLI app.
- `bun run start:cli`: run the CLI app normally.
- `bun test`: run Bun tests when tests exist.

## Runtime And Tooling

- Use Bun for package management and scripts.
- The current project was initialized with Bun `1.3.10`.
- The workspace uses ESM (`"type": "module"`).
- TypeScript is configured with `strict: true`, `moduleResolution: "Bundler"`, and `noEmit: true`.

## Coding Conventions

- Prefer existing local patterns before adding new abstractions.
- Keep app-specific code inside the relevant app until there is a clear reason to extract a package.
- Name component files and module paths with kebab-case such as `ascii-art-logo.tsx`. Keep TS/TSX component identifiers valid for the language, but do not use PascalCase for component file names or import paths.
- For the server, use Hono route handlers and return Hono responses through the context object.
- For the CLI, use OpenTUI React components and hooks rather than imperative terminal rendering unless necessary.
- **Never hardcode API URLs in the CLI.** Always use the Hono RPC client from `apps/cli/src/lib/client.ts` and derive URLs via typed methods (e.g., `client.llm.$url()`). The base URL is configured through `Bun.env.SERVER_URL` with a fallback to `http://localhost:3000`.
- Keep edits focused; avoid unrelated formatting or metadata churn.

## Verification

- For server changes, run `bun run start:server` or `bun run dev:server` and verify relevant routes.
- For CLI changes, run `bun run start:cli` in an interactive terminal.
- For shared TypeScript changes, run the most relevant app command and `bun test` if tests are present.
