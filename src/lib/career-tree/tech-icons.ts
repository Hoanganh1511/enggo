import * as simpleIcons from "simple-icons";
export type TechIcon = { path: string; color: string; title: string };

// simple-icons xuat key dang "si" + PascalCase-CHU-CHU-DAU (vd "postgresql"
// -> "siPostgresql", KHONG PHAI "siPostgreSQL") - ban cu chi viet hoa ky tu
// DAU, giu nguyen phan con lai, nen moi ten viet hoa giua chung (PostgreSQL,
// JavaScript, TypeScript, MongoDB, GraphQL...) deu tra ve sai key va luon
// null. Fix: lowercase toan bo roi moi viet hoa ky tu dau.
function toSlug(name: string): string {
  const cleaned = name.replace(/[^a-zA-Z0-9]/g, "").toLowerCase();
  return "si" + cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
}

// Mot so ten thuong dung trong career/skill tree co slug that KHAC han ten
// thuong goi (khong sua duoc chi bang quy tac casing o tren) - vd "Node.js"
// that ra la "nodedotjs" (vi "nodejs" bi trung/mo ho voi cac goi npm khac),
// "Express.js" chi la "express" (bo han "js"). Chuan hoa ve chu thuong truoc
// khi tra bang nay.
const ALIAS_SLUGS: Record<string, string> = {
  "node.js": "nodedotjs",
  nodejs: "nodedotjs",
  "next.js": "nextdotjs",
  nextjs: "nextdotjs",
  "vue.js": "vuedotjs",
  vuejs: "vuedotjs",
  "express.js": "express",
  expressjs: "express",
  ".net": "dotnet",
  dotnet: "dotnet",
  "c++": "cplusplus",
};

export function getTechIcon(tagName: string): TechIcon | null {
  const alias = ALIAS_SLUGS[tagName.trim().toLowerCase()];
  const slug = alias
    ? "si" + alias.charAt(0).toUpperCase() + alias.slice(1)
    : toSlug(tagName);
  const icon = (
    simpleIcons as Record<string, { path: string; hex: string; title: string }>
  )[slug];
  if (!icon) return null;
  return { path: icon.path, color: `#${icon.hex}`, title: icon.title };
}
