import { notFound, redirect } from "next/navigation";
import { getPostAction } from "@/actions/discover/get-post";
import { Composer } from "@/components/compose/Composer";
import { ApiError } from "@/lib/api/client";

// Trang SUA bai viet - chi tac gia (post.isOwner, xem PostService.findOne)
// moi vao duoc; nguoi khac/bai khong ton tai -> 404. Chua dang nhap -> 401
// tu apiFetch (khong gan Authorization) -> redirect /login. Cung convention
// voi u/[username]/workspaces/[slug]/edit/page.tsx (Document). Dung lai
// nguyen Composer.tsx (initialPost chuyen sang che do sua), khong phai form
// rieng - xem quyet dinh trong plan "Tính năng Sửa bài viết".
export default async function EditPostPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  let post;
  try {
    post = await getPostAction(id);
  } catch (e) {
    if (e instanceof ApiError && e.status === 404) notFound();
    if (e instanceof ApiError && e.status === 401) redirect("/login");
    throw e;
  }
  if (!post.isOwner) notFound();

  return <Composer initialPost={post} />;
}
