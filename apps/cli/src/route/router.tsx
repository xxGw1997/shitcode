import { createMemoryRouter } from "react-router";
import { Navigate } from "react-router";
import { appRoutes } from "./navigation";
import { RootLayout } from "./root-layout";
import { ChatScreen } from "@/screens/chat-screen";
import { HomeScreen } from "@/screens/home-screen";

export const router = createMemoryRouter([
  {
    path: "/",
    element: <RootLayout />,
    children: [
      { index: true, element: <Navigate to={appRoutes.home} replace /> },
      { path: appRoutes.home.slice(1), element: <HomeScreen /> },
      { path: "chat/:sessionId", element: <ChatScreen /> },
    ],
  },
]);
