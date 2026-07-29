import Image from "next/image";
import Link from "next/link";
import { BadgeCheck } from "lucide-react";
import type { Post } from "@/content/home-feed-mock";
import { POST_KIND_META } from "@/lib/discover/post-kind-meta";
import { formatRelativeTime } from "@/lib/career-tree/format-time";
import type {
  AchievementPost,
  MilestonePost,
  CareerUpdatePost,
  NodeCreatedPost,
} from "@/lib/discover/achievements";

// Khung chung cho 3 mau the "day du" (Achievement/Milestone/CareerUpdate) -
// dai accent trai + badge icon tron + nhan loai, than the la "children"
// rieng tung mau, footer avatar/ten/gio LUON nho va dat cuoi cung (noi dung
// thay doi/tien bo moi la diem nhan chinh, khong phai nguoi dang) - dung 1
// khung chung de 3 mau nhat quan kich thuoc, tranh 1 kind "trong to hon"
// kind khac (tranh 1 nguoi/1 loai cap nhat chiem spotlight).
function AchievementCardShell({
  post,
  children,
}: {
  post: Post;
  children: React.ReactNode;
}) {
  const meta = POST_KIND_META[post.kind];
  return (
    <div
      className="flex flex-col gap-3 overflow-hidden rounded-lg border border-border bg-surface"
      style={{ borderLeft: `3px solid ${meta.accent}` }}
    >
      <div className="flex flex-col gap-3 p-4">
        <span className="inline-flex w-fit items-center gap-1.5">
          <span
            className="flex size-5 shrink-0 items-center justify-center rounded-full text-white"
            style={{ background: meta.accent }}
          >
            <meta.icon size={11} strokeWidth={2.25} />
          </span>
          <span className="text-[10px] font-semibold tracking-wide text-ink-faint uppercase">
            {meta.label}
          </span>
        </span>

        {children}
      </div>

      <div className="flex min-w-0 items-center gap-1.5 border-t border-border px-4 py-2.5">
        <Link href={`/u/${post.author.username}`} className="shrink-0">
          <Image
            src={post.author.avatarUrl}
            alt={post.author.name}
            width={20}
            height={20}
            className="size-5 shrink-0 rounded-full object-cover"
          />
        </Link>
        <Link
          href={`/u/${post.author.username}`}
          className="min-w-0 truncate text-xs text-ink-muted hover:underline"
        >
          {post.author.name}
        </Link>
        {post.author.verified && (
          <BadgeCheck size={10} strokeWidth={2} className="shrink-0 text-primary" />
        )}
        <span className="text-ink-faint">·</span>
        <span className="shrink-0 text-[11px] text-ink-faint">
          {formatRelativeTime(post.createdAt)}
        </span>
      </div>
    </div>
  );
}

export function AchievementCard({ post }: { post: AchievementPost }) {
  return (
    <AchievementCardShell post={post}>
      <div>
        <p className="text-base font-bold text-ink">{post.title}</p>
        <p className="mt-1 text-sm text-ink-muted">{post.description}</p>
      </div>
    </AchievementCardShell>
  );
}

// So cot lai theo so items (2 hoac 3, xem seed-posts.ts) - divide-x can khop
// dung so cot moi co duong ke giua dep, khong de trong 1 o.
export function MilestoneCard({ post }: { post: MilestonePost }) {
  return (
    <AchievementCardShell post={post}>
      <div>
        <p className="text-sm font-semibold text-ink">{post.title}</p>
        {post.content && (
          <p className="mt-1 text-xs text-ink-faint">{post.content}</p>
        )}
        <div
          className={`mt-3 grid divide-x divide-border ${
            post.items.length === 2 ? "grid-cols-2" : "grid-cols-3"
          }`}
        >
          {post.items.map((item) => (
            <div
              key={item.label}
              className="flex flex-col items-center gap-0.5 px-1.5 text-center"
            >
              <span className="text-xl font-bold text-primary tabular-nums">
                {item.value}
              </span>
              <span className="text-[10px] text-ink-faint">{item.label}</span>
            </div>
          ))}
        </div>
      </div>
    </AchievementCardShell>
  );
}

// Tieu de dang "hanh dong" (Gia nhap {company}) thay vi chi hien role - khop
// phong cach mau tham khao "02. Standard Card" ("Joined NAB Vietnam" dam +
// "Software Engineer" phu de) hon ban truoc (chi hien role lam tieu de).
export function CareerUpdateCard({ post }: { post: CareerUpdatePost }) {
  return (
    <AchievementCardShell post={post}>
      <div>
        <p className="text-base font-bold text-ink">
          Gia nhập {post.company}
        </p>
        <p className="mt-1 text-sm text-ink-muted">{post.role}</p>
      </div>
    </AchievementCardShell>
  );
}

// Breadcrumb don gian {blockName} -> {nodeName}, nodeName hien dang pill
// noi bat - phong theo mau tham khao "06. Graph/Skill Tree Update" (cay ky
// nang thu nho voi node moi duoc highlight), nhung CHI dung dung 2 field
// that dang co (blockName/nodeName), khong bia them cay phan cap sau hon.
export function NodeCreatedCard({ post }: { post: NodeCreatedPost }) {
  return (
    <AchievementCardShell post={post}>
      <div className="flex flex-wrap items-center gap-1.5 text-sm">
        <span className="text-ink-muted">{post.blockName}</span>
        <span className="text-ink-faint">→</span>
        <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-semibold text-primary">
          {post.nodeName}
        </span>
      </div>
    </AchievementCardShell>
  );
}
