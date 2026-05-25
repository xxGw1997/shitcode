import { RouterProvider } from "react-router";
import { router } from "./route/router";

export function App() {
  return <RouterProvider router={router} />;
}
