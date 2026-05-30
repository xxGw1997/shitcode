export const appRoutes = {
  home: "/home",
  chat: (sessionId: string) => `/chat/${sessionId}`,
} as const;