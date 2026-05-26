import { createMemoryRouter } from "react-router";
import { Navigate } from "react-router";
import { appRoutes } from "./navigation";
import { RootLayout } from "./root-layout";
import { HomeScreen } from "./screens/home-screen";
import { NotFoundScreen } from "./screens/not-found-screen";
import { SettingsScreen } from "./screens/settings-screen";

export const router = createMemoryRouter([
  {
    path: "/",
    element: <RootLayout />,
    children: [
      { index: true, element: <Navigate to={appRoutes.home} replace /> },
      { path: appRoutes.home.slice(1), element: <HomeScreen /> },
      { path: appRoutes.settings.slice(1), element: <SettingsScreen /> },
      { path: "*", element: <NotFoundScreen /> },
    ],
  },
]);
