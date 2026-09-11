import { auth } from "@/auth";
import { getFeedCategoryTree } from "@/lib/api/feed-categories";
import { getProfileByUsername } from "@/lib/api/users";
import { listPostsAction } from "@/actions/discover/list-posts";
import { normalizePost } from "@/lib/discover/normalize-post";
import { ArticlesHero } from "@/components/discover/articles-hub/ArticlesHero";
import { MobileProfileSummaryRow } from "@/components/discover/articles-hub/MobileProfileSummaryRow";
import { SectionTitle } from "@/components/discover/articles-hub/SectionTitle";
import { CreatorRail } from "@/components/discover/articles-hub/CreatorRail";
import { TopicsRail } from "@/components/discover/articles-hub/TopicsRail";
import { ArticlesPostGrid } from "@/components/discover/articles-hub/ArticlesPostGrid";
import {
  RecentCollectionsSection,
  type CollectionsSectionPerson,
} from "@/components/discover/articles-hub/RecentCollectionsSection";
import { MOCK_CATEGORY_TREE } from "@/components/discover/articles-hub/category-tree-mock";
import { listUserCollectionsAction } from "@/actions/discover/collections/list-user-collections";
import { getFollowingAction } from "@/actions/discover/follow-user";
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

  // Author (khong phai CreatorSummary hep hon) - can du field (verified) cho
  // ca CreatorRail (chi doc 3 field) LAN forYouCandidates ben duoi (can them
  // verified).
  const creators: Author[] = [];
  const seenUsernames = new Set<string>();
  for (const post of posts) {
    if (seenUsernames.has(post.author.username)) continue;
    seenUsernames.add(post.author.username);
    creators.push(post.author);
    if (creators.length >= 12) break;
  }

  // "Bộ sưu tập gần đây" - tab "Dành cho bạn" (CHÍNH MÌNH truoc tien - dung
  // tinh than mockup nguoi dung gui, card dau tien la "Hồ sơ của tôi" - roi
  // tac gia bai gan day khac) + "Từ người bạn theo dõi" (theo he thong
  // Follow that). Chi 2 tab nay co du lieu that de lam - "Từ quản trị
  // viên"/"Cộng đồng" can khai niem chua tung co, de "Sắp có" (xem
  // RecentCollectionsSection.tsx).
  const selfCandidate: Author | null =
    username && mobileProfile
      ? {
          username,
          name: mobileProfile.displayName,
          avatarUrl: mobileProfile.avatarUrl,
          verified: mobileProfile.isVerified,
        }
      : null;
  const forYouCandidates = [
    ...(selfCandidate ? [selfCandidate] : []),
    ...creators.filter((c) => c.username !== username),
  ].slice(0, 6);
  const followingList = username
    ? await getFollowingAction(username).catch(() => ({ items: [], nextCursor: null }))
    : { items: [], nextCursor: null };
  const followingUsernames = new Set(
    followingList.items.map((u) => u.username).filter((u): u is string => Boolean(u)),
  );
  const followingCandidates = followingList.items.slice(0, 6);

  const [forYouResults, followingResults] = await Promise.all([
    Promise.all(
      forYouCandidates.map(async (author): Promise<CollectionsSectionPerson> => ({
        username: author.username,
        name: author.name,
        avatarUrl: author.avatarUrl,
        verified: author.verified,
        isSelf: author.username === username,
        isFollowing: followingUsernames.has(author.username),
        collections: await listUserCollectionsAction(author.username).catch(() => []),
      })),
    ),
    Promise.all(
      followingCandidates
        .filter((u) => u.username)
        .map(async (u): Promise<CollectionsSectionPerson> => ({
          username: u.username as string,
          name: u.displayName,
          avatarUrl: u.avatarUrl,
          verified: u.isVerified,
          isSelf: u.username === username,
          isFollowing: u.isFollowing,
          collections: await listUserCollectionsAction(u.username as string).catch(() => []),
        })),
    ),
  ]);
  const forYouPeople = forYouResults.filter((p) => p.collections.length > 0).slice(0, 5);
  const followingPeople = followingResults.filter((p) => p.collections.length > 0).slice(0, 5);

  return (
    <>
      <ArticlesHero writeHref={writeHref} />

      <RecentCollectionsSection
        forYou={forYouPeople}
        following={followingPeople}
        isLoggedIn={Boolean(username)}
      />

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

      <SectionTitle
        icon={Newspaper}
        title="Bài viết mới nhất"
        sub="Cập nhật liên tục từ mọi lĩnh vực"
      />
      <ArticlesPostGrid posts={posts} />
    </>
  );
}
