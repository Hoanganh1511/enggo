import ProfileFeedBox from "@/components/profile/ProfileFeedBox";
import { listPostsAction } from "@/actions/discover/list-posts";

// Tab "Bai dang" - toan bo bai cua chinh chu profile nay (khong gioi han 10
// nhu tab Trang chu).
export default async function ProfilePostsTabPage({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const { username } = await params;
  const posts = await listPostsAction({
    authorUsername: decodeURIComponent(username),
    limit: 50,
  });
  return <ProfileFeedBox heading="Tất cả bài đăng" posts={posts} />;
}
