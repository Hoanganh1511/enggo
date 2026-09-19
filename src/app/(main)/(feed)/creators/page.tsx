import { auth } from "@/auth";
import { listPostsAction } from "@/actions/discover/list-posts";
import { getFollowingAction } from "@/actions/discover/follow-user";
import { normalizePost } from "@/lib/discover/normalize-post";
import { CreatorRail, type CreatorSummary } from "@/components/discover/articles-hub/CreatorRail";
import type { Author } from "@/content/home-feed-mock";

// Trang rieng cho "Tác giả nổi bật" (yeu cau nguoi dung 2026-09-19: "Phần
// tác giả nổi bật giờ tạo 1 page riêng để hiển thị, thêm vào sidebar") -
// truoc day chi la 1 rail ngan tren /home (toi da 12 tac gia, xem
// home/page.tsx). Chua co 1 backend endpoint "top authors" that su (khong
// co bang rieng theo doi post-count/ranking) nen dung LAI dung ky thuat cua
// rail cu: dedupe author tu danh sach post gan day - CHI khac o day fetch
// mot lo LON HON (200 thay vi 48) de liet ke duoc NHIEU tac gia hon 12, dung
// cho 1 trang rieng thay vi 1 rail ngan gon tren /home.
export default async function CreatorsPage() {
  const session = await auth();
  const username = session?.username ?? null;

  const rawPosts = await listPostsAction({ limit: 200 }).catch(() => []);
  const posts = rawPosts.map(normalizePost);

  const authorCandidates: Author[] = [];
  const seenUsernames = new Set<string>();
  for (const post of posts) {
    if (seenUsernames.has(post.author.username)) continue;
    seenUsernames.add(post.author.username);
    authorCandidates.push(post.author);
  }

  const followingList = username
    ? await getFollowingAction(username).catch(() => ({ items: [], nextCursor: null }))
    : { items: [], nextCursor: null };
  const followingUsernames = new Set(
    followingList.items.map((u) => u.username).filter((u): u is string => Boolean(u)),
  );
  const creators: CreatorSummary[] = authorCandidates.map((author) => ({
    username: author.username,
    name: author.name,
    avatarUrl: author.avatarUrl,
    isFollowing: followingUsernames.has(author.username),
  }));

  return (
    <div className="w-full pb-20">
      <div className="font-content">
        <h1 className="text-[26px] font-extrabold tracking-tight text-ink">Tác giả nổi bật</h1>
        <p className="mt-1.5 text-[14px] text-ink-faint">
          Rút từ các bài viết gần đây trên toàn bộ nền tảng.
        </p>
      </div>

      <div className="mt-8">
        {creators.length === 0 ? (
          <p className="text-[14px] text-ink-faint">Chưa có tác giả nào.</p>
        ) : (
          <CreatorRail creators={creators} />
        )}
      </div>
    </div>
  );
}
