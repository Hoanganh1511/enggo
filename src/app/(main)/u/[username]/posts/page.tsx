import ProfileArticleGrid from "@/components/profile/ProfileArticleGrid";
import { listPostsAction } from "@/actions/discover/list-posts";
import { auth } from "@/auth";

// Tab "Bai dang" - toan bo bai cua chinh chu profile nay (khong gioi han 10
// nhu tab Trang chu). Sub-tab Tat ca/Cong khai/Rieng tu loc THAT theo
// Post.visibility (xem ProfileArticleGrid.tsx) - tab DUY NHAT truyen
// subTabs vi la tab CO du lieu that ho tro loc nay.
export default async function ProfilePostsTabPage({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const { username } = await params;
  const decodedUsername = decodeURIComponent(username);
  const [posts, session] = await Promise.all([
    listPostsAction({ authorUsername: decodedUsername, limit: 50 }),
    auth(),
  ]);
  const isSelf = session?.username === decodedUsername;
  return (
    <ProfileArticleGrid
      heading="Tất cả bài đăng"
      posts={posts}
      createHref={isSelf ? "/compose" : undefined}
      createLabel="Bài viết"
      subTabs={
        isSelf
          ? [
              { key: "all", label: "Tất cả" },
              { key: "public", label: "Công khai" },
              { key: "private", label: "Riêng tư" },
            ]
          : undefined
      }
    />
  );
}
