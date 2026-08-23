export type DocsTocItem = { id: string; text: string; level: number };

function slugifyHeading(text: string): string {
  return text
    .replace(/đ/gi, "d")
    .normalize("NFD")
    .replace(new RegExp("[\\u0300-\\u036f]", "g"), "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

// Trich muc luc TU CHINH noi dung markdown (dong bat dau bang "## "/"### ") -
// dung id GIONG HET voi id ma DocsMarkdown.tsx gan cho heading tuong ung (2
// noi dung phai dung 1 ham slugify de khong bao gio lech nhau, cung nguyen
// tac da ap dung cho extractTocFromContent/ArticleBody). Cac entry
// engineering-log HIEN TAI khong co heading con (chi dung **label:** in dam),
// nen phan lon bai se co TOC RONG - honest, khong bia muc luc gia.
export function extractDocsToc(markdown: string): DocsTocItem[] {
  const items: DocsTocItem[] = [];
  const seen = new Map<string, number>();
  for (const line of markdown.split("\n")) {
    const match = /^(#{2,3})\s+(.+)$/.exec(line.trim());
    if (!match) continue;
    const level = match[1].length;
    const text = match[2].trim();
    let id = slugifyHeading(text);
    const count = seen.get(id) ?? 0;
    seen.set(id, count + 1);
    if (count > 0) id = `${id}-${count}`;
    items.push({ id, text, level });
  }
  return items;
}

export { slugifyHeading };
