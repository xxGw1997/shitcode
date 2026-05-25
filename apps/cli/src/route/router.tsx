import { createMemoryRouter } from "react-router";
import { appRoutes } from "./navigation";
import { RootLayout } from "./root-layout";
import { HelpScreen } from "./screens/help-screen";
import { HomeScreen } from "./screens/home-screen";
import { NotFoundScreen } from "./screens/not-found-screen";

export const router = createMemoryRouter([
  {
    path: appRoutes.home,
    element: <RootLayout />,
    children: [
      { index: true, element: <HomeScreen /> },
      { path: appRoutes.help.slice(1), element: <HelpScreen /> },
      { path: "*", element: <NotFoundScreen /> },
    ],
  },
]);
