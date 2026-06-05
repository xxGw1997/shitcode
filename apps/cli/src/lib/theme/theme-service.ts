import { readFileSync } from "node:fs";
import { mkdir } from "node:fs/promises";
import { dirname, join } from "node:path";
import { isThemeName, themes, type Theme, type ThemeName } from "./themes";

type ThemeSettings = {
  theme?: string;
};

const settingsFileName = "settings.json";
const appConfigDirName = "shitcode";

export function getTheme(): Theme {
  const themeName = Bun.env.SHITCODE_THEME;

  if (themeName && isThemeName(themeName)) {
    return themes[themeName];
  }

  const savedThemeName = getSavedThemeName();

  if (savedThemeName) {
    return themes[savedThemeName];
  }

  return themes.default;
}

export async function saveThemeName(themeName: ThemeName) {
  const settingsPath = getThemeSettingsPath();

  if (!settingsPath) {
    return;
  }

  try {
    await mkdir(dirname(settingsPath), { recursive: true });
    await Bun.write(
      settingsPath,
      `${JSON.stringify({ theme: themeName } satisfies ThemeSettings, null, 2)}\n`,
    );
  } catch {
    // Theme persistence should never block theme switching.
  }
}

function getSavedThemeName(): ThemeName | null {
  const settingsPath = getThemeSettingsPath();

  if (!settingsPath) {
    return null;
  }

  try {
    const parsedSettings = JSON.parse(readFileSync(settingsPath, "utf8")) as ThemeSettings;
    const themeName = parsedSettings.theme;

    if (themeName && isThemeName(themeName)) {
      return themeName;
    }
  } catch {
    return null;
  }

  return null;
}

function getThemeSettingsPath() {
  const configDir = getConfigDir();

  if (!configDir) {
    return null;
  }

  return join(configDir, settingsFileName);
}

function getConfigDir() {
  if (process.platform === "win32") {
    const baseDir = Bun.env.APPDATA ?? Bun.env.USERPROFILE;

    return baseDir ? join(baseDir, appConfigDirName) : null;
  }

  if (Bun.env.XDG_CONFIG_HOME) {
    return join(Bun.env.XDG_CONFIG_HOME, appConfigDirName);
  }

  return Bun.env.HOME ? join(Bun.env.HOME, ".config", appConfigDirName) : null;
}
