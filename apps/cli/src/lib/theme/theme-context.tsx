import { useRenderer } from "@opentui/react";
import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { getTheme, saveThemeName } from "./theme-service";
import { themes, type Theme, type ThemeName } from "./themes";

type ThemeContextValue = {
  theme: Theme;
  themeName: ThemeName;
  setThemeName: (themeName: ThemeName) => void;
  setPreviewThemeName: (themeName: ThemeName | null) => void;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

type ThemeProviderProps = {
  children: ReactNode;
};

export function ThemeProvider({ children }: ThemeProviderProps) {
  const renderer = useRenderer();
  const [themeName, setThemeName] = useState<ThemeName>(() => getTheme().name);
  const [previewThemeName, setPreviewThemeName] = useState<ThemeName | null>(null);
  const theme = themes[previewThemeName ?? themeName];

  const selectThemeName = (nextThemeName: ThemeName) => {
    setThemeName(nextThemeName);
    setPreviewThemeName(null);
    void saveThemeName(nextThemeName);
  };

  useEffect(() => {
    renderer.setBackgroundColor(theme.colors.background);
  }, [renderer, theme.colors.background]);

  const value = useMemo(
    () => ({ theme, themeName, setThemeName: selectThemeName, setPreviewThemeName }),
    [theme, themeName],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme(): Theme {
  const context = useContext(ThemeContext);

  if (!context) {
    throw new Error("useTheme must be used inside <ThemeProvider>");
  }

  return context.theme;
}

export function useThemeController() {
  const context = useContext(ThemeContext);

  if (!context) {
    throw new Error("useThemeController must be used inside <ThemeProvider>");
  }

  return context;
}

export function useModeColor(modeId: string): string {
  const theme = useTheme();
  const modeColors: Record<string, string> = theme.modes;

  return modeColors[modeId] ?? theme.colors.primary;
}
