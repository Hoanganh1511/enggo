// Taxonomy 2 tang cho Discover feed: Nghe nghiep (nhom lon) -> Linh vuc (the
// cu the, la 1 trang rieng /home/category/[slug]). Dung chung giua
// HomeCategoryBar.tsx (chon), PostComposer.tsx (gan category khi dang bai)
// va home/category/[slug]/page.tsx (loc post qua API that).
//
// slug (kebab-case, dung tren URL) <-> enum PostCategory that o backend
// (UPPER_SNAKE_CASE, xem prisma/schema.prisma career-tree-api) chuyen doi 1-1
// qua slugToCategoryEnum()/categoryEnumToSlug() - GIU DUNG QUY UOC nay khi
// them linh vuc moi (slug moi phai doi ra dung 1 gia tri co san trong enum).

export type LinhVuc = {
  slug: string;
  label: string;
};

export type NgheNghiep = {
  slug: string;
  label: string;
  linhVuc: LinhVuc[];
};

export const NGHE_NGHIEP: NgheNghiep[] = [
  {
    slug: "ky-thuat",
    label: "Kỹ thuật",
    linhVuc: [
      { slug: "frontend", label: "Frontend" },
      { slug: "backend", label: "Backend" },
      { slug: "mobile", label: "Mobile" },
      { slug: "game-dev", label: "Game Dev" },
      { slug: "blockchain", label: "Blockchain" },
      { slug: "iot", label: "IoT" },
      { slug: "dev-tools", label: "Dev Tools" },
    ],
  },
  {
    slug: "du-lieu-ai",
    label: "Dữ liệu & AI",
    linhVuc: [
      { slug: "data-ai", label: "Data / AI" },
      { slug: "database", label: "Database" },
    ],
  },
  {
    slug: "san-pham-thiet-ke",
    label: "Sản phẩm & Thiết kế",
    linhVuc: [
      { slug: "product", label: "Product" },
      { slug: "ui-ux", label: "UI/UX" },
    ],
  },
  {
    slug: "van-hanh-ha-tang",
    label: "Vận hành & Hạ tầng",
    linhVuc: [
      { slug: "devops", label: "DevOps" },
      { slug: "cloud", label: "Cloud" },
      { slug: "system-design", label: "System Design" },
      { slug: "security", label: "Security" },
      { slug: "qa-test", label: "QA / Test" },
    ],
  },
  {
    slug: "phat-trien-ban-than",
    label: "Phát triển bản thân",
    linhVuc: [
      { slug: "career", label: "Career" },
      { slug: "soft-skills", label: "Soft Skills" },
    ],
  },
];

// Tra cuu nhanh tu slug -> LinhVuc (dung o trang [slug]/page.tsx).
export function getLinhVucBySlug(slug: string): LinhVuc | undefined {
  for (const nghe of NGHE_NGHIEP) {
    const found = nghe.linhVuc.find((lv) => lv.slug === slug);
    if (found) return found;
  }
  return undefined;
}

// "frontend" -> "FRONTEND", "data-ai" -> "DATA_AI", "qa-test" -> "QA_TEST".
// Khop dung enum PostCategory o backend vi ca 2 noi dung cung 1 quy uoc dat
// ten (thay "-" bang "_", viet hoa).
export function slugToCategoryEnum(slug: string): string {
  return slug.toUpperCase().replace(/-/g, "_");
}

export function categoryEnumToSlug(value: string): string {
  return value.toLowerCase().replace(/_/g, "-");
}
