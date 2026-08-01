// Taxonomy dieu huong cua trang Home: Knowledge World (nhom lon, vd "Build")
// -> Topic (the cu the, vd "Frontend"). THAY THE HOAN TOAN category-taxonomy.ts
// (taxonomy nghe nghiep cu) - Home la trang KHAM PHA NOI DUNG, khong phai
// trang chon nghe nghiep, nen khong con dung lai NGHE_NGHIEP nua.
//
// slug (kebab-case, dung tren query param ?topic=) <-> enum PostCategory that
// o backend (UPPER_SNAKE_CASE, xem prisma/schema.prisma career-tree-api)
// chuyen doi 1-1 qua slugToCategoryEnum()/categoryEnumToSlug() - GIU DUNG QUY
// UOC nay khi them topic moi (slug moi phai doi ra dung 1 gia tri co san
// trong enum).

export type Topic = {
  slug: string;
  label: string;
};

export type KnowledgeWorld = {
  slug: string;
  label: string;
  topics: Topic[];
};

export const KNOWLEDGE_WORLDS: KnowledgeWorld[] = [
  {
    slug: "build",
    label: "Build",
    topics: [
      { slug: "frontend", label: "Frontend" },
      { slug: "backend", label: "Backend" },
      { slug: "mobile", label: "Mobile" },
      { slug: "devops", label: "DevOps" },
      { slug: "cloud", label: "Cloud" },
      { slug: "database", label: "Database" },
      { slug: "blockchain", label: "Blockchain" },
    ],
  },
  {
    slug: "think",
    label: "Think",
    topics: [
      { slug: "system-design", label: "System Design" },
      { slug: "algorithms", label: "Algorithms" },
      { slug: "architecture", label: "Architecture" },
      { slug: "performance", label: "Performance" },
      { slug: "distributed-systems", label: "Distributed Systems" },
    ],
  },
  {
    slug: "ai",
    label: "AI",
    topics: [
      { slug: "prompt-engineering", label: "Prompt Engineering" },
      { slug: "llm", label: "LLM" },
      { slug: "ai-agents", label: "AI Agents" },
      { slug: "mcp", label: "MCP" },
      { slug: "rag", label: "RAG" },
      { slug: "computer-vision", label: "Computer Vision" },
    ],
  },
  {
    slug: "create",
    label: "Create",
    topics: [
      { slug: "ui", label: "UI" },
      { slug: "ux", label: "UX" },
      { slug: "motion", label: "Motion" },
      { slug: "figma", label: "Figma" },
      { slug: "design-system", label: "Design System" },
    ],
  },
  {
    slug: "career",
    label: "Career",
    topics: [
      { slug: "resume", label: "Resume" },
      { slug: "interview", label: "Interview" },
      { slug: "productivity", label: "Productivity" },
      { slug: "remote", label: "Remote" },
      { slug: "freelance", label: "Freelance" },
    ],
  },
  {
    slug: "business",
    label: "Business",
    topics: [
      { slug: "product", label: "Product" },
      { slug: "startup", label: "Startup" },
      { slug: "growth", label: "Growth" },
      { slug: "marketing", label: "Marketing" },
    ],
  },
];

// Tra cuu nhanh tu slug -> Topic (dung o trang Home de hien label tu ?topic=).
export function getTopicBySlug(slug: string): Topic | undefined {
  for (const world of KNOWLEDGE_WORLDS) {
    const found = world.topics.find((t) => t.slug === slug);
    if (found) return found;
  }
  return undefined;
}

// Tra cuu World chua 1 Topic - dung de biet Topic dang chon co con thuoc
// World moi hay khong (quy tac reset: doi World thi reset Topic, TRU KHI
// topic hien tai van thuoc world moi - trong taxonomy nay moi topic chi
// thuoc dung 1 world nen thuc te luon reset khi doi world).
export function getWorldByTopicSlug(slug: string): KnowledgeWorld | undefined {
  return KNOWLEDGE_WORLDS.find((w) => w.topics.some((t) => t.slug === slug));
}

// "ai-agents" -> "AI_AGENTS", "system-design" -> "SYSTEM_DESIGN". Khop dung
// enum PostCategory o backend vi ca 2 noi dung cung 1 quy uoc dat ten (thay
// "-" bang "_", viet hoa).
export function slugToCategoryEnum(slug: string): string {
  return slug.toUpperCase().replace(/-/g, "_");
}

export function categoryEnumToSlug(value: string): string {
  return value.toLowerCase().replace(/_/g, "-");
}
