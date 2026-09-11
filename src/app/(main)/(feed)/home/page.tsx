import { auth } from "@/auth";
import { getFeedCategoryTree } from "@/lib/api/feed-categories";
import { listPostsAction } from "@/actions/discover/list-posts";
import { listPublicCollectionsAction } from "@/actions/discover/collections/list-public-collections";
import { normalizePost } from "@/lib/discover/normalize-post";
import { ArticlesHero } from "@/components/discover/articles-hub/ArticlesHero";
import { SectionTitle } from "@/components/discover/articles-hub/SectionTitle";
import { CreatorRail } from "@/components/discover/articles-hub/CreatorRail";
import { AttentionCollectionsRail } from "@/components/discover/articles-hub/AttentionCollectionsRail";
import { NewestSection } from "@/components/discover/articles-hub/NewestSection";
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

  const [rawPosts, attentionCollections, categoryTree] = await Promise.all([
    listPostsAction({ limit: 48 }).catch(() => []),
    // "Bộ sưu tập đang được chú ý" - top bo suu tap CONG KHAI theo so bai viet
    // that (sort "most-posts") - xem AttentionCollectionsRail.tsx.
    listPublicCollectionsAction({ scope: "all", sort: "most-posts", limit: 10 })
      .then((r) => r.items)
      .catch(() => []),
    // Cay nhom chu de nghe nghiep - dung de xep hang cho NewestSection ben
    // duoi (moi nhom 1 hang), KHONG phai de hien TopicsRail (da xoa han).
    getFeedCategoryTree().catch(() => []),
  ]);
  const posts = rawPosts.map(normalizePost);

  // "Bài viết mới nhất theo chủ đề" - moi nhom nghe nghiep 1 hang, toi da 20
  // bai/hang qua careerGroup (tu mo rong ca nhanh con, xem post.controller.ts).
  // KHAC BAN MOCK CU (newest-topics-mock.ts, da xoa vi 100% gia): day la du
  // lieu THAT tu API, nen nhom nao chua co bai (careerGroup moi/it nguoi
  // dung) se TU AN thay vi bia so lieu - xem NewestSection.tsx.
  const newestGroups = (
    await Promise.all(
      categoryTree.map(async (group) => ({
        slug: group.slug,
        name: group.name,
        posts: await listPostsAction({ careerGroup: group.slug, limit: 20 })
          .then((p) => p.map(normalizePost))
          .catch(() => []),
      })),
    )
  ).filter((g) => g.posts.length > 0);

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

      <NewestSection groups={newestGroups} />
    </>
  );
}
