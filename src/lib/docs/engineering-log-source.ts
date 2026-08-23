import { readFile } from "node:fs/promises";
import path from "node:path";
import {
  categorizeEngineeringLogEntry,
  type EngineeringLogCategory,
} from "./engineering-log-categories";

export type EngineeringLogArticle = {
  slug: string;
  title: string;
  date: string; // YYYY-MM-DD
  category: EngineeringLogCategory;
  // Markdown THO (dung cho nut "Copy Markdown" va render qua react-markdown)
  body: string;
};

function slugify(input: string): string {
  return input
    .replace(/đ/gi, "d")
    .normalize("NFD")
    .replace(new RegExp("[\\u0300-\\u036f]", "g"), "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

let cache: EngineeringLogArticle[] | null = null;

// Doc THANG docs/engineering-log.md (chinh file da co san, xem CLAUDE.md/
// feedback memory "Engineering log habit") va parse thanh danh sach bai viet
// cho trang /docs/engineering-log - "toàn bộ data là từ những gì đã giải
// quyết vấn đề lớn" (yeu cau nguoi dung) tuc la KHONG bia noi dung rieng cho
// UI nay, doc THAT tu nguon duy nhat. Moi entry la 1 block bat dau bang "## "
// (H2), ket thuc truoc "## " tiep theo hoac het file; dong dau entry co dang
// "YYYY-MM-DD — Tieu de mo ta".
export async function getEngineeringLogArticles(): Promise<EngineeringLogArticle[]> {
  if (cache) return cache;

  const filePath = path.join(process.cwd(), "docs", "engineering-log.md");
  const raw = await readFile(filePath, "utf-8");

  // Bo phan intro (H1 + doan mo dau) truoc entry "## " dau tien.
  const chunks = raw.split(/\n##\s+/).slice(1);

  const articles: EngineeringLogArticle[] = [];
  for (const chunk of chunks) {
    const newlineIdx = chunk.indexOf("\n");
    const heading = chunk.slice(0, newlineIdx).trim();
    const body = chunk
      .slice(newlineIdx + 1)
      .replace(/\n-{3,}\s*$/, "")
      .trim();

    const match = /^(\d{4}-\d{2}-\d{2})\s*—\s*(.+)$/.exec(heading);
    const date = match?.[1] ?? "";
    const title = (match?.[2] ?? heading).trim();

    const category = categorizeEngineeringLogEntry(title);
    if (category === "hidden") continue;

    articles.push({
      slug: slugify(title),
      title,
      date,
      category,
      body,
    });
  }

  articles.sort((a, b) => b.date.localeCompare(a.date));
  cache = articles;
  return articles;
}

export async function getEngineeringLogArticle(
  slug: string,
): Promise<EngineeringLogArticle | null> {
  const articles = await getEngineeringLogArticles();
  return articles.find((a) => a.slug === slug) ?? null;
}
