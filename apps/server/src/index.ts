import { Hono } from "hono";
import { createGreeting, runtimeName } from "@shitcode/shared";

const app = new Hono();

app.get("/", (c) => {
  return c.json({
    name: "@shitcode/server",
    message: createGreeting("@shitcode/server"),
  });
});

app.get("/health", (c) => {
  return c.json({
    ok: true,
    runtime: runtimeName,
  });
});

const port = Number(Bun.env.PORT ?? 3000);

export default {
  port,
  fetch: app.fetch,
};

console.log(`Server running at http://localhost:${port}`);
