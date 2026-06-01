import { RouterProvider } from "react-router";
import { router } from "./route/router";
import { ModeProvider } from "./lib/mode-context";

export function App() {
  return (
    <ModeProvider>
      <RouterProvider router={router} />
    </ModeProvider>
  );
}
