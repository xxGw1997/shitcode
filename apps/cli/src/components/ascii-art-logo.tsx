import type { ASCIIFontName } from "@opentui/core";
import { useTheme } from "@/lib/theme";

type AsciiArtLogoProps = {
  text?: string;
  font?: ASCIIFontName;
};

export function AsciiArtLogo({ text = "SHITCODE", font = "block" }: AsciiArtLogoProps) {
  const theme = useTheme();

  return (
    <ascii-font
      text={text}
      font={font}
      color={[theme.colors.primary, theme.colors.logoBlue, theme.colors.logoWhite]}
      selectable={false}
    />
  );
}
