import { RouterProvider } from "react-router";
import { DialogProvider } from "@/components/dialog";
import { ModeProvider } from "@/lib/mode/mode-context";
import { ThemeProvider } from "@/lib/theme";
import { router } from "@/route/router";

export function App() {
  return (
    <ThemeProvider>
      <ModeProvider>
        <DialogProvider>
          <RouterProvider router={router} />
        </DialogProvider>
      </ModeProvider>
    </ThemeProvider>
  );
}
