import { auth } from "@/auth";
import { getFeedCategoryTree } from "@/lib/api/feed-categories";
import { getProfileByUsername } from "@/lib/api/users";
import { listPostsAction } from "@/actions/discover/list-posts";
import { normalizePost } from "@/lib/discover/normalize-post";
import { ArticlesHero } from "@/components/discover/articles-hub/ArticlesHero";
import { MobileProfileSummaryRow } from "@/components/discover/articles-hub/MobileProfileSummaryRow";
import { SectionTitle } from "@/components/discover/articles-hub/SectionTitle";
import {
  CreatorRail,
  type CreatorSummary,
} from "@/components/discover/articles-hub/CreatorRail";
import { TopicsRail } from "@/components/discover/articles-hub/TopicsRail";
import { MOCK_CATEGORY_TREE } from "@/components/discover/articles-hub/category-tree-mock";
import { Flame, Users } from "lucide-react";

// /articles - port giao dien tu source knowledge-dashboard-note-knowledge-hub-style.zip
// (ban goc tieng Nhat kieu Zenn.dev, da doi copy sang tieng Anh/Viet khop tone
// con lai cua app - khong ship nguyen van tieng Nhat demo). Dung CHUNG sidebar
// voi /home qua (feed)/layout.tsx (xem file do) - trang nay KHONG tu ve
// sidebar rieng nua. Server Component thuan + 1 island client duy nhat
// (NewestSection - tab loc theo linh vuc).
export default async function ArticlesPage() {
  const session = await auth();
  const username = session?.username ?? null;
  const writeHref = username ? `/workspace/${username}` : "/login";

  const [realCategoryTree, rawPosts, mobileProfile] = await Promise.all([
    getFeedCategoryTree().catch(() => []),
    listPostsAction({ limit: 48 }).catch(() => []),
    // Dong tom tat ho so mobile (MobileProfileSummaryRow) - chi fetch khi da
    // dang nhap, bo qua neu chua co session (khong bia du lieu).
    username ? getProfileByUsername(username).catch(() => null) : Promise.resolve(null),
  ]);
  // Fallback TAM: categoryTree that dang rong (backend chi tinh nhom co bai
  // trong 7 ngay gan nhat, hien khong co bai nao du moi - xem
  // category-tree-mock.ts). Chi dung khi that su rong, nen ngay khi co bai
  // that trong 7 ngay, du lieu that se tu dong thay the.
  const categoryTree =
    realCategoryTree.length > 0 ? realCategoryTree : MOCK_CATEGORY_TREE;
  const posts = rawPosts.map(normalizePost);

  const creators: CreatorSummary[] = [];
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
        title="Chủ đề đang hot"
        sub="Lĩnh vực hoạt động nhiều trong 7 ngày qua"
      />
      <TopicsRail categoryTree={categoryTree} />
    </>
  );
}
