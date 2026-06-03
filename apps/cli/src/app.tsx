import { RouterProvider } from "react-router";
import { ModeProvider } from "@/lib/mode/mode-context";
import { router } from "@/route/router";

export function App() {
  return (
    <ModeProvider>
      <RouterProvider router={router} />
    </ModeProvider>
  );
}
