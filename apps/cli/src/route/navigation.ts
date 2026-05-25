export const appRoutes = {
  home: "/",
  help: "/help",
} as const;

export const navigationItems = [
  { label: "Home", path: appRoutes.home, shortcut: "F1" },
  { label: "Help", path: appRoutes.help, shortcut: "F2" },
] as const;
