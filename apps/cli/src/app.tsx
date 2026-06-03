import { RouterProvider } from "react-router";
import { DialogProvider } from "@/components/dialog";
import { ModeProvider } from "@/lib/mode/mode-context";
import { router } from "@/route/router";

export function App() {
  return (
    <ModeProvider>
      <DialogProvider>
        <RouterProvider router={router} />
      </DialogProvider>
    </ModeProvider>
  );
}
