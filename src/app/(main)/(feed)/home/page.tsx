import { auth } from "@/auth";
import { getProfileByUsername } from "@/lib/api/users";
import { listPostsAction } from "@/actions/discover/list-posts";
import { listPublicCollectionsAction } from "@/actions/discover/collections/list-public-collections";
import { normalizePost } from "@/lib/discover/normalize-post";
import { ArticlesHero } from "@/components/discover/articles-hub/ArticlesHero";
import { MobileProfileSummaryRow } from "@/components/discover/articles-hub/MobileProfileSummaryRow";
import { SectionTitle } from "@/components/discover/articles-hub/SectionTitle";
import { CreatorRail } from "@/components/discover/articles-hub/CreatorRail";
import { AttentionCollectionsRail } from "@/components/discover/articles-hub/AttentionCollectionsRail";
import { ArticlesPostGrid } from "@/components/discover/articles-hub/ArticlesPostGrid";
import { Flame, Newspaper, Users } from "lucide-react";
import type { Author } from "@/content/home-feed-mock";

// /home - port giao dien tu source knowledge-dashboard-note-knowledge-hub-style.zip
// (ban goc tieng Nhat kieu Zenn.dev, da doi copy sang tieng Anh/Viet khop tone
// con lai cua app - khong ship nguyen van tieng Nhat demo). Dung CHUNG sidebar
// voi /articles qua (feed)/layout.tsx (xem file do) - trang nay KHONG tu ve
// sidebar rieng nua. Server Component thuan + 1 island client duy nhat
// (ArticlesPostGrid - the bai dung framer-motion, xem file do).
// DOI CHO voi /articles theo yeu cau nguoi dung (2026) - noi dung nay TRUOC
// DAY nam o /articles, gio chuyen sang day; sidebar (HomeDashboardSidebar.tsx)
// GIU NGUYEN, khong doi nhan/href.
export default async function ArticlesPage() {
  const session = await auth();
  const username = session?.username ?? null;
  const writeHref = username ? `/workspace/${username}` : "/login";

  const [rawPosts, mobileProfile, attentionCollections] = await Promise.all([
    listPostsAction({ limit: 48 }).catch(() => []),
    // Dong tom tat ho so mobile (MobileProfileSummaryRow) - chi fetch khi da
    // dang nhap, bo qua neu chua co session (khong bia du lieu).
    username ? getProfileByUsername(username).catch(() => null) : Promise.resolve(null),
    // "Bộ sưu tập đang được chú ý" - top bo suu tap CONG KHAI theo so bai viet
    // that (sort "most-posts"), thay cho "Chủ đề đang hot" cu (xem
    // AttentionCollectionsRail.tsx).
    listPublicCollectionsAction({ scope: "all", sort: "most-posts", limit: 10 })
      .then((r) => r.items)
      .catch(() => []),
  ]);
  const posts = rawPosts.map(normalizePost);

  // Author (khong phai CreatorSummary hep hon cua CreatorRail) - chi can 3
  // field (username/name/avatarUrl) nhung giu nguyen shape Author cho gon,
  // khong tach type rieng chi de bot vai field.
  const creators: Author[] = [];
  const seenUsernames = new Set<string>();
  for (const post of posts) {
    if (seenUsernames.has(post.author.username)) continue;
    seenUsernames.add(post.author.username);
    creators.push(post.author);
    if (creators.length >= 12) break;
  }

  return (
    <>
      <ArticlesHero writeHref={writeHref} />

      {mobileProfile && <MobileProfileSummaryRow profile={mobileProfile} />}

      <SectionTitle
        icon={Users}
        title="Tác giả nổi bật"
        sub="Rút từ các bài viết gần đây"
      />
      <CreatorRail creators={creators} />

      <SectionTitle
        icon={Flame}
        title="Bộ sưu tập đang được chú ý"
        sub="Nhiều bài viết nhất từ cộng đồng"
      />
      <AttentionCollectionsRail collections={attentionCollections} />

      <SectionTitle
        icon={Newspaper}
        title="Bài viết mới nhất"
        sub="Cập nhật liên tục từ mọi lĩnh vực"
      />
      <ArticlesPostGrid posts={posts} />
    </>
  );
}
