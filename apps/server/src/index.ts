import { app } from "./app";

const port = Number(Bun.env.PORT ?? 3000);

export default {
  port,
  fetch: app.fetch,
};

console.log(`Server running at http://localhost:${port}`);
