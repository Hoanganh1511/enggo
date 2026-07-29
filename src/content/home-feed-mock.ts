// Dinh nghia type cho he thong Post - DU LIEU THAT lay tu backend qua
// src/lib/api/posts.ts + src/lib/discover/feed-store.ts (PostModule trong
// career-tree-api, xem prisma/seed-posts.ts cho du lieu seed). File nay
// (ten cu "home-feed-mock" - giu nguyen de khoi phai doi duong dan import o
// ~20 file khac) gio CHI CON type, khong con mang POSTS/SNAPSHOT/... cung nao
// nua. 2 danh sach chua "that hoa" duoc (PEOPLE_TO_FOLLOW/TRENDING_SKILLS,
// can he thong Follow that - ngoai pham vi lan nay) chuyen sang
// people-to-follow-mock.ts, ghi ro la mock.
//
// Post la discriminated union theo "kind" - MOI kind co body rieng (xem
// src/components/discover/post-bodies/) thay vi 1 "attachment" chung chung
// cho tat ca: Text/Image/Gallery/Video/File/Link/Resource/Note/ProjectUpdate/
// Achievement/Milestone/Question/Poll/CareerUpdate/SkillUpdate/NodeCreated/
// KnowledgeBlock/TimelineEvent/SkillReport deu co dang trinh bay rieng, nhan
// dien duoc ngay ca khi khong doc text.
//
// 6 kind (link/resource/achievement/project-update/knowledge-block/tutorial)
// TRUOC DAY co field icon/accent RIENG tung post - da bo, vi component
// (LucideIcon) khong the luu duoc vao cot Json cua backend. Gio TAT CA deu
// lay icon/accent theo KIND tu POST_KIND_META (post-kind-meta.ts) - dong
// nhat voi cach PostCard.tsx danh dau loai bai o marker, khong con lech nhau.
export type Author = {
  name: string;
  username: string;
  verified: boolean;
  avatarUrl: string;
};

type PostCommon = {
  id: string;
  author: Author;
  // ISO timestamp that (Post.createdAt tu backend) - thay cho chuoi
  // "timeAgo" dung san truoc day. PostCard.tsx tu tinh thanh "2 giờ trước"
  // qua formatRelativeTime() (src/lib/career-tree/format-time.ts).
  createdAt: string;
  stats: { likes: number; comments: number; reposts: number };
  // liked/saved: CHUA co bang Like/Save that o backend (xem quyet dinh "seed
  // data thật" - chi so tinh, khong tuong tac that) nen 2 field nay hien
  // luon undefined tu API - giu lai trong type de UI (vd tab "Đã thích" o
  // ProfileView) khong vo, don gian hien rong thay vi bao loi.
  liked?: boolean;
  saved?: boolean;
  // Breadcrumb "danh muc kien thuc" THUAN HIEN THI (vd ["Backend", "Node.js"])
  // - doan cuoi la chu de cu the, hien dam + mau accent. KHONG map toi
  // workspace/category/node THAT nao ca (khac han skill-report - xem
  // SkillReportBody.tsx co breadcrumb rieng gan voi id/modal that) - chi la
  // tag phan loai chu de, nen dung duoc cho MOI kind/tac gia (ke ca 5 persona
  // seed khong co workspace that). Optional vi skill-report khong dung field
  // nay (da co breadcrumb that rieng).
  topic?: { path: string[]; accent: string };
};

export type ImageAsset = { url: string; alt: string };

export type Post =
  | (PostCommon & { kind: "text"; content: string })
  | (PostCommon & { kind: "image"; content?: string; image: ImageAsset })
  | (PostCommon & { kind: "gallery"; content?: string; images: ImageAsset[] })
  | (PostCommon & {
      kind: "video";
      content?: string;
      video: { thumbnailUrl: string; duration: string };
    })
  | (PostCommon & {
      kind: "file";
      content?: string;
      file: { name: string; ext: string; size: string };
    })
  | (PostCommon & {
      kind: "link";
      content?: string;
      link: { domain: string; title: string; description: string };
    })
  | (PostCommon & {
      kind: "resource";
      content?: string;
      resource: { title: string; kindLabel: string; rating: number };
    })
  | (PostCommon & {
      kind: "note";
      title: string;
      content: string;
      tag?: string;
    })
  | (PostCommon & {
      kind: "project-update";
      project: string;
      version: string;
      changes: string[];
    })
  | (PostCommon & {
      kind: "achievement";
      title: string;
      description: string;
    })
  | (PostCommon & {
      kind: "milestone";
      content?: string;
      title: string;
      items: { label: string; value: string }[];
    })
  | (PostCommon & { kind: "question"; content: string })
  | (PostCommon & {
      kind: "poll";
      question: string;
      options: { label: string; votes: number }[];
    })
  | (PostCommon & { kind: "career-update"; company: string; role: string })
  | (PostCommon & {
      kind: "skill-update";
      skill: string;
      level: number;
      maxLevel: number;
    })
  | (PostCommon & {
      kind: "node-created";
      nodeName: string;
      blockName: string;
    })
  | (PostCommon & {
      kind: "knowledge-block";
      block: string;
      progress: number;
    })
  | (PostCommon & { kind: "timeline-event"; event: string })
  | (PostCommon & {
      kind: "skill-report";
      content: string;
      workspaceId: string;
      workspaceName: string;
      categoryId: string;
      categoryName: string;
      categoryAccent: string;
      nodeId: string;
      nodeTitle: string;
    })
  | (PostCommon & {
      kind: "code-snippet";
      language: string;
      title?: string;
      code: string;
    })
  | (PostCommon & { kind: "idea"; content: string })
  | (PostCommon & {
      kind: "tutorial";
      title: string;
      description: string;
      steps: number;
    })
  | (PostCommon & {
      kind: "experiment";
      title: string;
      hypothesis: string;
      result: string;
    })
  | (PostCommon & {
      kind: "event";
      title: string;
      when: string;
      location?: string;
    });
