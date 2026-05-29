import { Hono } from "hono";
import { chatRoute } from "./routes/chat";

export const app = new Hono().route("/chat", chatRoute);

export type AppType = typeof app;