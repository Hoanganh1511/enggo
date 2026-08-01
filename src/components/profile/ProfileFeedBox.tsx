import type { Post } from "@/content/home-feed-mock";
import PostCard from "@/components/discover/PostCard";

// Khung "the trang" chua danh sach bai dang cua 1 tab - dung chung cho moi
// page.tsx con cua profile (home/posts/likes/history...), chi khac heading +
// danh sach posts truyen vao.
const ProfileFeedBox = ({
  heading,
  posts,
}: {
  heading: string;
  posts: Post[];
}) => {
  return (
    <div className="rounded-lg  bg-surface">
      <div className="border-b border-border py-3">
        <h2 className="text-sm font-bold text-ink">{heading}</h2>
      </div>

      <div className="">
        {posts.length === 0 ? (
          <p className="py-12 text-center text-sm text-ink-faint">
            Chưa có nội dung nào ở mục này.
          </p>
        ) : (
          <div className="divide-y divide-border">
            {posts.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfileFeedBox;
