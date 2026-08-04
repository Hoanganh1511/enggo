import Link from "next/link";
import type { Post } from "@/content/home-feed-mock";
import { POST_KIND_META } from "@/lib/discover/post-kind-meta";
import { cn } from "@/lib/utils";
import { ContentTile } from "./ContentTile";
import { AuthorLine } from "./AuthorLine";
import { CompactStats } from "./CompactStats";
import { getPostTitle, getPostImageUrl } from "./post-display";

// The bai dang DUY NHAT dung lap lai cho MOI section dang carousel (Featured/
// Resources/Projects/Questions/Achievements) - theo dung tinh than note.com
// (anh chiem phan lon the, caption gon ben duoi, gan nhu khong vien/shadow)
// thay vi moi content-type 1 khuon rieng nhu ban dau (da chu dinh don gian
// hoa lai, danh doi mat "content hierarchy" rieng biet de giong dung tham
// chieu hon). Dung chung 1 khuon nen chi can `post: Post` generic, khong can
// discriminate theo kind nhu cac card cu (ResourceCard/ProjectCard/...).
//
// CAU TRUC: anh+tieu de boc trong Link RIENG toi /p/[id] (trang chi tiet bai
// viet), AuthorLine nam NGOAI Link do va TU boc Link rieng toi trang tac gia
// (xem AuthorLine.tsx) - 2 vung bam doc lap, KHONG long <Link> trong <Link>
// (bug <a> long nhau da gap truoc day, trinh duyet tu "sua" DOM sai cach).
export function NoteCard({
  post,
  className = "w-56 shrink-0 snap-start",
  sizes = "224px",
  priority = false,
}: {
  post: Post;
  // Doi duoc tu ngoai - mac dinh la kich thuoc co dinh cho carousel
  // (HorizontalScroller), nhung khi dung trong luoi tu gian (vd
  // SingleTypeFeedList.tsx) can "w-full" de the gian het o luoi cua no.
  className?: string;
  // Phai khop voi kich thuoc hien thi thuc te theo tung noi goi (carousel
  // co dinh 224px khac luoi tu gian) - xem ContentTile.tsx.
  sizes?: string;
  // Chi true cho vai the dau cua section "Noi bat hom nay" (ung vien LCP) -
  // xem EditorialFeed.tsx.
  priority?: boolean;
}) {
  const kindMeta = POST_KIND_META[post.kind];
  const title = getPostTitle(post);

  return (
    <div className={cn("flex flex-col gap-2", className)}>
      <Link href={`/p/${post.id}`} className="flex flex-col gap-2">
        <ContentTile
          icon={kindMeta.icon}
          accent={kindMeta.accent}
          imageUrl={getPostImageUrl(post)}
          alt={title}
          className="aspect-1280/670 w-full"
          iconSize={32}
          sizes={sizes}
          priority={priority}
        />
        <h3 className="line-clamp-3 text-base leading-snug font-semibold text-ink">
          {title}
        </h3>
      </Link>
      <AuthorLine
        author={post.author}
        createdAt={post.createdAt}
        avatarSize={18}
      />
      <CompactStats likes={post.stats.likes} comments={post.stats.comments} />
    </div>
  );
}

// Skeleton cung khung voi NoteCard that (anh ti le 1280/670 + 2 dong tieu de
// + hang tac gia + hang stat) - thay cho cac SkeletonBlock hinh chu nhat
// chung chung truoc day khong giong hinh dang layout hien tai (carousel/luoi
// the anh), khien luc dang tai trong nhu 1 khoi xam vo nghia thay vi "bong
// dang" cua feed sap hien ra.
export function NoteCardSkeleton({
  className = "w-56 shrink-0",
}: {
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col gap-2", className)}>
      <div className="aspect-1280/670 w-full animate-pulse rounded-xl bg-surface-muted" />
      <div className="h-4 w-full animate-pulse rounded bg-surface-muted" />
      <div className="h-4 w-2/3 animate-pulse rounded bg-surface-muted" />
      <div className="flex items-center gap-2 pt-1">
        <div className="size-4.5 shrink-0 animate-pulse rounded-full bg-surface-muted" />
        <div className="h-3 w-24 animate-pulse rounded bg-surface-muted" />
      </div>
    </div>
  );
}
