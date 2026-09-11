import { notFound } from "next/navigation";
import { auth } from "@/auth";
import { listSavedPostsAction } from "@/actions/discover/list-saved-posts";
import ProfileArticleGrid from "@/components/profile/ProfileArticleGrid";

// Tab "Đã lưu" - RIENG BIET voi "Bộ sưu tập" (PostCollection, tab canh ben -
// xem yeu cau nguoi dung 2026-09-13: 2 tab tung dung chung 1 icon Bookmark
// gay nham "Lưu" tren bai viet la vao day hay vao Bộ sưu tập). Danh sach
// nay LUON la CUA CHINH nguoi dang dang nhap (GET /posts/saved khong nhan
// username, xem post.controller.ts) - notFound() thang neu khong phai
// chinh chu, tranh hien nham du lieu cua nguoi xem cho profile nguoi khac
// (ProfileTabBar.tsx da an tab nay voi nguoi khac roi, day la lop chan THU
// 2 phong truy cap thang qua URL).
export default async function ProfileSavedTabPage({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const { username } = await params;
  const decodedUsername = decodeURIComponent(username);
  const session = await auth();
  if (session?.username !== decodedUsername) notFound();

  const page = await listSavedPostsAction().catch(() => ({
    items: [],
    nextCursor: null,
  }));

  return (
    <ProfileArticleGrid
      heading="Đã lưu"
      description="Những bài viết bạn đã lưu lại để đọc sau."
      posts={page.items}
    />
  );
}
