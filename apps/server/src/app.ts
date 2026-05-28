import { Hono } from "hono";
import { createGreeting, runtimeName } from "@shitcode/shared";

export const app = new Hono()
  .get("/", (c) => {
    return c.json({
      name: "@shitcode/server",
      message: createGreeting("@shitcode/server"),
    });
  })
  .get("/health", (c) => {
    return c.json({
      ok: true,
      timestamp: new Date().toISOString(),
      runtime: runtimeName,
    });
  });

export type AppType = typeof app;
