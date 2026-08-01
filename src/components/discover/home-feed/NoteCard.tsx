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
export function NoteCard({
  post,
  className = "w-56 shrink-0 snap-start",
}: {
  post: Post;
  // Doi duoc tu ngoai - mac dinh la kich thuoc co dinh cho carousel
  // (HorizontalScroller), nhung khi dung trong luoi tu gian (vd
  // SingleTypeFeedList.tsx) can "w-full" de the gian het o luoi cua no.
  className?: string;
}) {
  const kindMeta = POST_KIND_META[post.kind];
  const title = getPostTitle(post);

  return (
    <Link
      href={`/u/${post.author.username}`}
      className={cn("flex flex-col gap-2", className)}
    >
      <ContentTile
        icon={kindMeta.icon}
        accent={kindMeta.accent}
        imageUrl={getPostImageUrl(post)}
        alt={title}
        className="aspect-1280/670 w-full"
        iconSize={32}
      />
      <h3 className="line-clamp-2 text-sm leading-snug font-semibold text-ink">
        {title}
      </h3>
      <AuthorLine author={post.author} createdAt={post.createdAt} avatarSize={18} />
      <CompactStats likes={post.stats.likes} comments={post.stats.comments} />
    </Link>
  );
}
