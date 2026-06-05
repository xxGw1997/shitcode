import { RGBA } from "@opentui/core";

export const themeNames = [
  "default",
  "verdant",
  "dracula",
  "nord",
  "catppuccin",
  "gruvbox",
  "solarized-dark",
  "tokyo-night",
  "one-dark",
  "monokai",
  "rose-pine",
  "ayu-dark",
] as const;

export type ThemeName = (typeof themeNames)[number];

export type Theme = {
  name: ThemeName;
  colors: {
    background: string;
    surface: string;
    text: string;
    textStrong: string;
    textInverse: string;
    textMuted: string;
    textSubtle: string;
    textDim: string;
    border: string;
    primary: string;
    primaryMuted: string;
    primarySoft: string;
    accent: string;
    assistant: string;
    logoBlue: string;
    logoWhite: string;
    warning: string;
    error: string;
    errorStrong: string;
    white: string;
    gray: string;
    transparent: string;
  };
  modes: Record<string, string>;
  overlay: {
    dialog: RGBA;
  };
};

export const defaultTheme = {
  name: "default",
  colors: {
    background: "#0a0a0a",
    surface: "#1E1E1E",
    text: "#e5e7eb",
    textStrong: "#e2e8f0",
    textInverse: "#1E1E1E",
    textMuted: "#94a3b8",
    textSubtle: "#64748b",
    textDim: "#475569",
    border: "#475569",
    primary: "#facc15",
    primaryMuted: "#fbbf24",
    primarySoft: "#fcd34d",
    accent: "#fab283",
    assistant: "#22d3ee",
    logoBlue: "#38bdf8",
    logoWhite: "#f8fafc",
    warning: "#f59e0b",
    error: "#f87171",
    errorStrong: "#ef4444",
    white: "#FFFFFF",
    gray: "#808080",
    transparent: "transparent",
  },
  modes: {
    build: "#facc15",
    plan: "#9d7cd8",
  },
  overlay: {
    dialog: RGBA.fromValues(0, 0, 0, 0.72),
  },
} as const satisfies Theme;

export const verdantTheme = {
  name: "verdant",
  colors: {
    background: "#07110f",
    surface: "#10201c",
    text: "#dcfce7",
    textStrong: "#f0fdf4",
    textInverse: "#10201c",
    textMuted: "#8fb5a9",
    textSubtle: "#5f8075",
    textDim: "#3f5f55",
    border: "#2d5a4d",
    primary: "#34d399",
    primaryMuted: "#6ee7b7",
    primarySoft: "#a7f3d0",
    accent: "#a3e635",
    assistant: "#67e8f9",
    logoBlue: "#22d3ee",
    logoWhite: "#ecfdf5",
    warning: "#fbbf24",
    error: "#fb7185",
    errorStrong: "#f43f5e",
    white: "#f8fafc",
    gray: "#94a3b8",
    transparent: "transparent",
  },
  modes: {
    build: "#34d399",
    plan: "#67e8f9",
  },
  overlay: {
    dialog: RGBA.fromValues(0, 12, 9, 0.76),
  },
} as const satisfies Theme;

export const draculaTheme = {
  name: "dracula",
  colors: {
    background: "#282a36",
    surface: "#343746",
    text: "#f8f8f2",
    textStrong: "#ffffff",
    textInverse: "#282a36",
    textMuted: "#b7b9cc",
    textSubtle: "#8588a6",
    textDim: "#6272a4",
    border: "#6272a4",
    primary: "#bd93f9",
    primaryMuted: "#caa9fa",
    primarySoft: "#dcc6fb",
    accent: "#ff79c6",
    assistant: "#8be9fd",
    logoBlue: "#8be9fd",
    logoWhite: "#f8f8f2",
    warning: "#f1fa8c",
    error: "#ff5555",
    errorStrong: "#ff6e6e",
    white: "#f8f8f2",
    gray: "#6272a4",
    transparent: "transparent",
  },
  modes: {
    build: "#50fa7b",
    plan: "#bd93f9",
  },
  overlay: {
    dialog: RGBA.fromValues(40, 42, 54, 0.78),
  },
} as const satisfies Theme;

export const nordTheme = {
  name: "nord",
  colors: {
    background: "#2e3440",
    surface: "#3b4252",
    text: "#d8dee9",
    textStrong: "#eceff4",
    textInverse: "#2e3440",
    textMuted: "#a7b1c2",
    textSubtle: "#8792a3",
    textDim: "#6b7484",
    border: "#4c566a",
    primary: "#88c0d0",
    primaryMuted: "#8fbcbb",
    primarySoft: "#b4d7df",
    accent: "#81a1c1",
    assistant: "#8fbcbb",
    logoBlue: "#5e81ac",
    logoWhite: "#eceff4",
    warning: "#ebcb8b",
    error: "#bf616a",
    errorStrong: "#d06f79",
    white: "#eceff4",
    gray: "#4c566a",
    transparent: "transparent",
  },
  modes: {
    build: "#a3be8c",
    plan: "#b48ead",
  },
  overlay: {
    dialog: RGBA.fromValues(46, 52, 64, 0.78),
  },
} as const satisfies Theme;

export const catppuccinTheme = {
  name: "catppuccin",
  colors: {
    background: "#1e1e2e",
    surface: "#313244",
    text: "#cdd6f4",
    textStrong: "#f5e0dc",
    textInverse: "#1e1e2e",
    textMuted: "#a6adc8",
    textSubtle: "#7f849c",
    textDim: "#6c7086",
    border: "#45475a",
    primary: "#cba6f7",
    primaryMuted: "#b4befe",
    primarySoft: "#d0b7f8",
    accent: "#f5c2e7",
    assistant: "#89dceb",
    logoBlue: "#89b4fa",
    logoWhite: "#cdd6f4",
    warning: "#f9e2af",
    error: "#f38ba8",
    errorStrong: "#eba0ac",
    white: "#cdd6f4",
    gray: "#6c7086",
    transparent: "transparent",
  },
  modes: {
    build: "#a6e3a1",
    plan: "#cba6f7",
  },
  overlay: {
    dialog: RGBA.fromValues(30, 30, 46, 0.78),
  },
} as const satisfies Theme;

export const gruvboxTheme = {
  name: "gruvbox",
  colors: {
    background: "#282828",
    surface: "#3c3836",
    text: "#ebdbb2",
    textStrong: "#fbf1c7",
    textInverse: "#282828",
    textMuted: "#bdae93",
    textSubtle: "#928374",
    textDim: "#665c54",
    border: "#665c54",
    primary: "#fabd2f",
    primaryMuted: "#d79921",
    primarySoft: "#f9d57a",
    accent: "#fe8019",
    assistant: "#8ec07c",
    logoBlue: "#83a598",
    logoWhite: "#fbf1c7",
    warning: "#fabd2f",
    error: "#fb4934",
    errorStrong: "#cc241d",
    white: "#fbf1c7",
    gray: "#928374",
    transparent: "transparent",
  },
  modes: {
    build: "#b8bb26",
    plan: "#d3869b",
  },
  overlay: {
    dialog: RGBA.fromValues(40, 40, 40, 0.78),
  },
} as const satisfies Theme;

export const solarizedDarkTheme = {
  name: "solarized-dark",
  colors: {
    background: "#002b36",
    surface: "#073642",
    text: "#839496",
    textStrong: "#eee8d5",
    textInverse: "#002b36",
    textMuted: "#93a1a1",
    textSubtle: "#657b83",
    textDim: "#586e75",
    border: "#586e75",
    primary: "#268bd2",
    primaryMuted: "#2aa198",
    primarySoft: "#6cbae8",
    accent: "#b58900",
    assistant: "#2aa198",
    logoBlue: "#268bd2",
    logoWhite: "#fdf6e3",
    warning: "#cb4b16",
    error: "#dc322f",
    errorStrong: "#ff5f5f",
    white: "#fdf6e3",
    gray: "#657b83",
    transparent: "transparent",
  },
  modes: {
    build: "#859900",
    plan: "#6c71c4",
  },
  overlay: {
    dialog: RGBA.fromValues(0, 43, 54, 0.78),
  },
} as const satisfies Theme;

export const tokyoNightTheme = {
  name: "tokyo-night",
  colors: {
    background: "#1a1b26",
    surface: "#24283b",
    text: "#c0caf5",
    textStrong: "#ffffff",
    textInverse: "#1a1b26",
    textMuted: "#a9b1d6",
    textSubtle: "#787c99",
    textDim: "#565f89",
    border: "#414868",
    primary: "#7aa2f7",
    primaryMuted: "#2ac3de",
    primarySoft: "#a7c4ff",
    accent: "#bb9af7",
    assistant: "#7dcfff",
    logoBlue: "#7aa2f7",
    logoWhite: "#c0caf5",
    warning: "#e0af68",
    error: "#f7768e",
    errorStrong: "#ff7a93",
    white: "#c0caf5",
    gray: "#565f89",
    transparent: "transparent",
  },
  modes: {
    build: "#9ece6a",
    plan: "#bb9af7",
  },
  overlay: {
    dialog: RGBA.fromValues(26, 27, 38, 0.78),
  },
} as const satisfies Theme;

export const oneDarkTheme = {
  name: "one-dark",
  colors: {
    background: "#282c34",
    surface: "#353b45",
    text: "#abb2bf",
    textStrong: "#dcdfe4",
    textInverse: "#282c34",
    textMuted: "#9da5b4",
    textSubtle: "#6f7786",
    textDim: "#5c6370",
    border: "#4b5263",
    primary: "#61afef",
    primaryMuted: "#56b6c2",
    primarySoft: "#9bcdf8",
    accent: "#c678dd",
    assistant: "#56b6c2",
    logoBlue: "#61afef",
    logoWhite: "#abb2bf",
    warning: "#e5c07b",
    error: "#e06c75",
    errorStrong: "#f07178",
    white: "#abb2bf",
    gray: "#5c6370",
    transparent: "transparent",
  },
  modes: {
    build: "#98c379",
    plan: "#c678dd",
  },
  overlay: {
    dialog: RGBA.fromValues(40, 44, 52, 0.78),
  },
} as const satisfies Theme;

export const monokaiTheme = {
  name: "monokai",
  colors: {
    background: "#272822",
    surface: "#3a3b32",
    text: "#f8f8f2",
    textStrong: "#ffffff",
    textInverse: "#272822",
    textMuted: "#cfcfc2",
    textSubtle: "#9f9f8f",
    textDim: "#75715e",
    border: "#75715e",
    primary: "#a6e22e",
    primaryMuted: "#66d9ef",
    primarySoft: "#c6f46d",
    accent: "#fd971f",
    assistant: "#66d9ef",
    logoBlue: "#66d9ef",
    logoWhite: "#f8f8f2",
    warning: "#e6db74",
    error: "#f92672",
    errorStrong: "#ff4f91",
    white: "#f8f8f2",
    gray: "#75715e",
    transparent: "transparent",
  },
  modes: {
    build: "#a6e22e",
    plan: "#ae81ff",
  },
  overlay: {
    dialog: RGBA.fromValues(39, 40, 34, 0.78),
  },
} as const satisfies Theme;

export const rosePineTheme = {
  name: "rose-pine",
  colors: {
    background: "#191724",
    surface: "#26233a",
    text: "#e0def4",
    textStrong: "#f6f2ff",
    textInverse: "#191724",
    textMuted: "#908caa",
    textSubtle: "#6e6a86",
    textDim: "#555168",
    border: "#403d52",
    primary: "#c4a7e7",
    primaryMuted: "#9ccfd8",
    primarySoft: "#dac8f0",
    accent: "#ebbcba",
    assistant: "#9ccfd8",
    logoBlue: "#31748f",
    logoWhite: "#e0def4",
    warning: "#f6c177",
    error: "#eb6f92",
    errorStrong: "#f07c9f",
    white: "#e0def4",
    gray: "#6e6a86",
    transparent: "transparent",
  },
  modes: {
    build: "#31748f",
    plan: "#c4a7e7",
  },
  overlay: {
    dialog: RGBA.fromValues(25, 23, 36, 0.78),
  },
} as const satisfies Theme;

export const ayuDarkTheme = {
  name: "ayu-dark",
  colors: {
    background: "#0f1419",
    surface: "#1f2430",
    text: "#bfbdb6",
    textStrong: "#e6e1cf",
    textInverse: "#0f1419",
    textMuted: "#9da6ac",
    textSubtle: "#707a83",
    textDim: "#5c6773",
    border: "#343f4b",
    primary: "#ffb454",
    primaryMuted: "#e6b673",
    primarySoft: "#ffd08a",
    accent: "#ff8f40",
    assistant: "#59c2ff",
    logoBlue: "#59c2ff",
    logoWhite: "#e6e1cf",
    warning: "#ffee99",
    error: "#f07178",
    errorStrong: "#ff6b73",
    white: "#e6e1cf",
    gray: "#5c6773",
    transparent: "transparent",
  },
  modes: {
    build: "#b8cc52",
    plan: "#d2a6ff",
  },
  overlay: {
    dialog: RGBA.fromValues(15, 20, 25, 0.78),
  },
} as const satisfies Theme;

export const themes = {
  default: defaultTheme,
  verdant: verdantTheme,
  dracula: draculaTheme,
  nord: nordTheme,
  catppuccin: catppuccinTheme,
  gruvbox: gruvboxTheme,
  "solarized-dark": solarizedDarkTheme,
  "tokyo-night": tokyoNightTheme,
  "one-dark": oneDarkTheme,
  monokai: monokaiTheme,
  "rose-pine": rosePineTheme,
  "ayu-dark": ayuDarkTheme,
} as const satisfies Record<ThemeName, Theme>;

export function isThemeName(value: string): value is ThemeName {
  return value in themes;
}
