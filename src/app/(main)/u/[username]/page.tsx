import ProfileArticleGrid from "@/components/profile/ProfileArticleGrid";
import { listPostsAction } from "@/actions/discover/list-posts";
import { auth } from "@/auth";

// Tab "Trang chu" - 10 bai moi nhat cua chinh chu profile nay, hien luoi
// note.com style (xem ProfileArticleGrid.tsx). Cum Theo doi/Nhắn tin/stat
// da chuyen ve ProfileSidebar.tsx (dung vi tri cua note.com - sidebar CO
// DINH qua moi tab, khong phai rieng cho trang nay).
export default async function ProfileHomeTabPage({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const { username } = await params;
  const decodedUsername = decodeURIComponent(username);
  const [posts, session] = await Promise.all([
    listPostsAction({ authorUsername: decodedUsername, limit: 10 }),
    auth(),
  ]);
  const isSelf = session?.username === decodedUsername;
  return (
    <ProfileArticleGrid
      heading="Bài đăng mới nhất"
      description="10 bài gần đây nhất của bạn."
      posts={posts}
      createHref={isSelf ? "/compose" : undefined}
      createLabel="Bài viết"
    />
  );
}
