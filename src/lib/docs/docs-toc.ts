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

// Bo tag HTML tho co the nam NGAY TRONG dong heading (vd 1 <span
// style="color:..."> to mau so thu tu "01." - xem engineering-log-source.ts)
// - yeu cau nguoi dung: "Bên TOC bị lỗi" (kem anh: muc luc hien nguyen van
// "<span style=...>01.</span> SQS vs SNS..." thay vi chi "01. SQS vs SNS...").
// Nguyen nhan: ham nay doc THANG tu CHUOI MARKDOWN THO (chua qua react-markdown
// parse), khac headingId() trong DocsMarkdown.tsx (dung childrenToText() SAU
// KHI react-markdown+rehypeRaw da parse HTML do thanh React element that, tu
// nhien chi con lai text). Khong strip se lech ca 2 cho: hien thi SAI (lo HTML
// tho) LAN id slugify SAI (lan ca chu trong style="..." vao id), lam link
// "#id" trong TOC KHONG CON TRUNG voi id that gan tren heading (DocsMarkdown.tsx),
// bam vao khong nhay den dung vi tri.
function stripHtmlTags(text: string): string {
  return text.replace(/<[^>]*>/g, "");
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
    const text = stripHtmlTags(match[2].trim()).trim();
    let id = slugifyHeading(text);
    const count = seen.get(id) ?? 0;
    seen.set(id, count + 1);
    if (count > 0) id = `${id}-${count}`;
    items.push({ id, text, level });
  }
  return items;
}

export { slugifyHeading };
