type AsciiArtLogoProps = {
  text?: string;
};

export function AsciiArtLogo({ text = "SHITCODE" }: AsciiArtLogoProps) {
  return <ascii-font text={text} font="tiny" color="#facc15" selectable={false} />;
}
