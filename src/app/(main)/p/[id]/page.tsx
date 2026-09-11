import { notFound } from "next/navigation";
import { getPostAction } from "@/actions/discover/get-post";
import { listPostsAction } from "@/actions/discover/list-posts";
import { getProfileByUsername } from "@/lib/api/users";
import type { Post } from "@/content/home-feed-mock";
import {
  getPostTitle,
  getPostImageUrl,
} from "@/components/discover/home-feed/post-display";
import { getPostContentText } from "@/lib/discover/article-content";
import { renderTiptapHTML } from "@/lib/discover/render-tiptap-html";
import { getPostExtensions } from "@/components/workspaces/post-extensions";
import { ArticleHeader } from "@/components/article/ArticleHeader";
import { ArticleTableOfContents } from "@/components/article/ArticleTableOfContents";
import { ArticleBody } from "@/components/article/ArticleBody";
import { ArticleActionBar } from "@/components/article/ArticleActionBar";
import { ArticleAuthorCard } from "@/components/article/ArticleAuthorCard";
import { ArticleStickyAuthorBar } from "@/components/article/ArticleStickyAuthorBar";
import { ArticlePrevNextNav } from "@/components/article/ArticlePrevNextNav";
import { ArticleComments } from "@/components/article/ArticleComments";
import { ArticleRecommendations } from "@/components/article/ArticleRecommendations";
import type { PostSummary } from "@/components/article/article-types";

function toSummary(post: Post): PostSummary {
  return {
    id: post.id,
    title: getPostTitle(post),
    imageUrl: getPostImageUrl(post),
    createdAt: post.createdAt,
  };
}

// Trang chi tiet 1 Post THAT (khong con la "Article" mock rieng - da doi
// huong lai, xem quyet dinh 2026-08-03 trong docs/engineering-log.md). Cot
// noi dung chinh gioi han max 620px de de doc. ArticleStickyAuthorBar dinh
// tren (sticky top-0) hien THAY CHO ArticleAuthorCard trong luc nguoi doc
// cuon qua than bai ma chua toi duoc card that o duoi - tu an khi card that
// (id "article-author-card") vao viewport, xem component do.
export default async function PostDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const post = await getPostAction(id).catch(() => null);
  if (!post) notFound();

  const [authorPosts, relatedPosts, profile] = await Promise.all([
    listPostsAction({ authorUsername: post.author.username, limit: 20 }).catch(
      () => [] as Post[],
    ),
    post.category
      ? listPostsAction({ category: [post.category], limit: 10 }).catch(
          () => [] as Post[],
        )
      : Promise.resolve([] as Post[]),
    getProfileByUsername(post.author.username).catch(() => null),
  ]);

  const currentIndex = authorPosts.findIndex((p) => p.id === post.id);
  const prev = currentIndex >= 0 ? authorPosts[currentIndex + 1] : undefined;
  const next = currentIndex > 0 ? authorPosts[currentIndex - 1] : undefined;

  const moreFromAuthor = authorPosts
    .filter((p) => p.id !== post.id)
    .slice(0, 4)
    .map(toSummary);
  const related = relatedPosts
    .filter(
      (p) => p.id !== post.id && p.author.username !== post.author.username,
    )
    .slice(0, 4)
    .map(toSummary);

  const content = getPostContentText(post);
  // Bai dang qua Composer.tsx co richContent (JSON Tiptap THAT, giu nguyen
  // heading/dinh dang - khac `content` o tren chi la doan tom tat ngan ≤600
  // ky tu, khong phai than bai day du). Render 1 LAN DUY NHAT o day, dung
  // chung cho ca ArticleBody (html) VA ArticleTableOfContents (headings) -
  // dam bao id khop tuyet doi giua 2 noi (xem ghi chu trong
  // render-tiptap-html.ts).
  const rich =
    post.kind === "text" && post.richContent
      ? renderTiptapHTML(post.richContent, getPostExtensions())
      : null;
  return (
    <div className="mx-auto flex w-full max-w-155 flex-col gap-6 px-4 py-6">
      <ArticleStickyAuthorBar
        author={post.author}
        followerCount={profile?.followerCount}
        isFollowing={profile?.isFollowing ?? false}
        isSelf={profile?.isSelf ?? false}
        authorCardId="article-author-card"
      />

      <ArticleHeader post={post} />

      <ArticleTableOfContents content={content} richHeadings={rich?.headings} />
      <ArticleBody post={post} richHtml={rich?.html} />
      <ArticleActionBar
        likes={post.stats.likes}
        commentCount={post.stats.comments}
      />
      <ArticleAuthorCard
        author={post.author}
        bio={profile?.bio}
        followerCount={profile?.followerCount}
        isFollowing={profile?.isFollowing ?? false}
        isSelf={profile?.isSelf ?? false}
      />
      <ArticlePrevNextNav
        prev={prev && toSummary(prev)}
        next={next && toSummary(next)}
      />
      {/* comments rong - chua co model/API Comment that cho Post (chi co
          stats.comments la SO DEM), xem ArticleComments.tsx/article-types.ts. */}
      <ArticleComments comments={[]} />
      <ArticleRecommendations
        moreFromAuthor={moreFromAuthor}
        related={related}
      />
    </div>
  );
}
