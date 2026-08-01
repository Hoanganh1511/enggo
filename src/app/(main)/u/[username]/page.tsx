import ProfileFeedBox from "@/components/profile/ProfileFeedBox";
import { listPostsAction } from "@/actions/discover/list-posts";

// Tab "Trang chu" - 10 bai moi nhat cua chinh chu profile nay.
export default async function ProfileHomeTabPage({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const { username } = await params;
  const posts = await listPostsAction({
    authorUsername: decodeURIComponent(username),
    limit: 10,
  });
  return <ProfileFeedBox heading="Bài đăng mới nhất" posts={posts} />;
}
