import type { Post } from "@/content/home-feed-mock";

// Chi cac kind co truong "content" (text/image/gallery/video/file/link/
// resource/note) moi co van ban tho de doc - cac kind con lai (project-update/
// achievement/poll/...) khong co, ArticleBody.tsx se fallback ve PostBody
// (component render dung dang rieng cua kind do) khi ham nay tra ve rong.
export function getPostContentText(post: Post): string {
  return "content" in post && post.content ? post.content : "";
}

export type ContentLine =
  | { type: "heading"; id: string; level: 2 | 3; text: string }
  | { type: "paragraph"; text: string };

// Parse "## "/"### " (markdown-lite) THANH heading, phan con lai la doan van
// thuong - dung CHUNG giua ArticleTableOfContents.tsx (chi loc phan heading)
// va ArticleBody.tsx (render toan bo) de 2 noi LUON khop id, khong the lech
// nhau vi chi co 1 nguon logic sinh id duy nhat o day.
export function parseContentLines(content: string): ContentLine[] {
  const lines: ContentLine[] = [];
  let headingIndex = 0;
  const paragraphs = content.split(/\n{2,}/);
  for (const para of paragraphs) {
    const headingMatch = para.trim().match(/^(#{2,3})\s+(.+)$/);
    if (headingMatch) {
      const text = headingMatch[2].trim();
      const id = `heading-${headingIndex}-${text
        .toLowerCase()
        .replace(/[^a-z0-9À-ỹ]+/gi, "-")}`;
      headingIndex += 1;
      lines.push({
        type: "heading",
        id,
        level: headingMatch[1].length === 2 ? 2 : 3,
        text,
      });
    } else if (para.trim()) {
      lines.push({ type: "paragraph", text: para.trim() });
    }
  }
  return lines;
}
