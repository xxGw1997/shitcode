import type { ASCIIFontName } from "@opentui/core";

type AsciiArtLogoProps = {
  text?: string;
  font?: ASCIIFontName;
};

export function AsciiArtLogo({ text = "SHITCODE", font = "block" }: AsciiArtLogoProps) {
  return (
    <ascii-font
      text={text}
      font={font}
      color={["#facc15", "#38bdf8", "#f8fafc"]}
      selectable={false}
    />
  );
}
