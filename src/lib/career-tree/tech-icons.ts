import * as simpleIcons from "simple-icons";
export type TechIcon = { path: string; color: string; title: string };

function toSlug(name: string): string {
  return (
    "si" +
    name.replace(/[^a-zA-Z0-9]/g, "").replace(/^[a-z]/, (c) => c.toUpperCase())
  );
}

export function getTechIcon(tagName: string): TechIcon | null {
  const icon = (
    simpleIcons as Record<string, { path: string; hex: string; title: string }>
  )[toSlug(tagName)];
  if (!icon) return null;
  return { path: icon.path, color: `#${icon.hex}`, title: icon.title };
}
