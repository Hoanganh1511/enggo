import Image from "next/image";
import Link from "next/link";
import { Bookmark, Heart, Folder } from "lucide-react";
import type { NormalizedPost } from "@/lib/discover/normalize-post";
import { formatRelativeTime } from "@/lib/format-time";
import { SectionTitle } from "./SectionTitle";
import { ScrollableRow } from "./ScrollableRow";
import { NewestCardMenu } from "./NewestCardMenu";

export type NewestSectionGroup = {
  slug: string;
  name: string;
  posts: NormalizedPost[];
};

// Server Component thuan - nhieu hang theo nhom nghe nghiep (kieu Netflix),
// moi hang cuon ngang toi da 20 the. KHAC BAN CU (newest-topics-mock.ts, da
// xoa vi 100% du lieu gia - "Frontend"/"Backend" voi like count bia san) -
// `groups` truyen vao la KET QUA THAT tu listPostsAction({ careerGroup }) roi
// normalizePost() (xem home/page.tsx), da loc san CHI con nhom co it nhat 1
// bai - khong con nhom nao hien ra rong/gia ca. Card rong CO DINH 212px
// (w-53), link thang toi /p/[id] - khac ban cu (card tinh, khong bam duoc)
// vi gio la bai that.
export function NewestSection({ groups }: { groups: NewestSectionGroup[] }) {
  if (groups.length === 0) return null;

  return (
    <div>
      {groups.map((group) => (
        <div key={group.slug}>
          <SectionTitle title={group.name} />
          <ScrollableRow gapClassName="gap-4">
            {group.posts.map((post) => (
              <div
                key={post.id}
                className="group w-53 shrink-0 overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--surface)] shadow-[var(--shadow-card)] transition-shadow duration-200 hover:shadow-[var(--shadow-hover)]"
              >
                <Link href={`/p/${post.id}`} className="block">
                  <div className="relative aspect-[1.8] overflow-hidden bg-gradient-to-br from-slate-100 to-slate-200">
                    {post.image ? (
                      <Image
                        src={post.image}
                        alt=""
                        fill
                        sizes="212px"
                        className="object-cover transition duration-500 group-hover:scale-[1.03]"
                      />
                    ) : (
                      <div className="flex size-full items-center justify-center text-slate-400">
                        <Folder size={22} strokeWidth={1.6} />
                      </div>
                    )}
                    <span className="absolute top-3 left-3 rounded-full bg-white/90 px-2 py-1 text-[10px] font-medium text-[var(--foreground-muted)] shadow-sm">
                      {formatRelativeTime(post.createdAt)}
                    </span>
                  </div>
                  <div className="font-content p-4 pb-0">
                    <h3 className="line-clamp-2 text-[14px] leading-5 font-semibold text-[var(--foreground)]">
                      {post.title}
                    </h3>
                    <p className="mt-3 truncate text-[11px] text-[var(--muted)]">
                      {post.author.name}
                    </p>
                  </div>
                </Link>
                {/* Hang like/save (trai) va menu 3 cham (phai) nam NGOAI Link
                    cha - NewestCardMenu tu mo popover, khong duoc long trong
                    the <a> (click se dong thoi kich hoat dieu huong). */}
                <div className="flex items-center justify-between p-4 pt-2">
                  <div className="flex items-center gap-3 text-[11px] text-[var(--muted)]">
                    <span className="flex items-center gap-1">
                      <Heart size={13} aria-hidden="true" />
                      {post.likeCount}
                    </span>
                    {/* Chua co bang Save that cho card nay (giong PostCard.tsx
                        o feed chinh) - icon hien thi, KHONG lam nut bam luu
                        duoc. */}
                    <span aria-hidden="true">
                      <Bookmark size={13} />
                    </span>
                  </div>
                  <NewestCardMenu />
                </div>
              </div>
            ))}
          </ScrollableRow>
        </div>
      ))}
    </div>
  );
}
