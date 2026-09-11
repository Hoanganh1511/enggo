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
import { ArticleSidebar } from "@/components/article/ArticleSidebar";
import { ArticleBody } from "@/components/article/ArticleBody";
import { ArticleActionBar } from "@/components/article/ArticleActionBar";
import { ArticleAuthorCard } from "@/components/article/ArticleAuthorCard";
import { ArticleStickyAuthorBar } from "@/components/article/ArticleStickyAuthorBar";
import { ArticlePrevNextNav } from "@/components/article/ArticlePrevNextNav";
import { ArticleComments } from "@/components/article/ArticleComments";
import { ArticleRecommendations } from "@/components/article/ArticleRecommendations";
import type { PostSummary } from "@/components/article/article-types";
import { buildCommentTree } from "@/components/article/comment-tree";
import { listPostCommentsAction } from "@/actions/discover/post-comments/list-post-comments";

const WORDS_PER_MINUTE = 200;

function toSummary(post: Post): PostSummary {
  const text = getPostContentText(post);
  const wordCount = text ? text.trim().split(/\s+/).length : 0;
  return {
    id: post.id,
    title: getPostTitle(post),
    imageUrl: getPostImageUrl(post),
    createdAt: post.createdAt,
    readMinutes: wordCount > 0 ? Math.max(1, Math.round(wordCount / WORDS_PER_MINUTE)) : undefined,
  };
}

// Trang chi tiet 1 Post THAT (khong con la "Article" mock rieng - da doi
// huong lai, xem quyet dinh 2026-08-03 trong docs/engineering-log.md). Bo
// cuc 3 cot tu 1200px+ (dung mocktup responsive nguoi dung gui - Tablet
// 768-1199px VAN la 1 cot, khong phai tu lg=1024px nhu Tailwind mac dinh,
// nen dung breakpoint tuy chinh "min-[1200px]:" thay vi "lg:"): cot TRAI
// dinh (ArticleStickyAuthorBar, chi hien khi cuon qua card tac gia that o
// duoi) + cot GIUA noi dung chinh (max 900px, gom ArticleHeader anh bia/
// tieu de/mo ta/thich/binh luan/tac gia GON + ArticleBody dung CHUNG 1
// max-width - tang o day se rong ca 2 theo, xem yeu cau nguoi dung) + cot
// PHAI dinh (Muc luc/Bai viet lien quan, xem ArticleSidebar.tsx) - 2 cot
// dinh doi xung nhau theo yeu cau nguoi dung. Duoi 1200px (ke ca tablet)
// chi con 1 cot: Muc luc thu gon inline + thanh hanh dong dinh duoi cung
// (theo mockup nguoi dung gui), khong co cot trai/phai (khong du cho).
export default async function PostDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const post = await getPostAction(id).catch(() => null);
  if (!post) notFound();

  const [authorPosts, relatedPosts, profile, rawComments] = await Promise.all([
    listPostsAction({ authorUsername: post.author.username, limit: 20 }).catch(
      () => [] as Post[],
    ),
    post.category
      ? listPostsAction({ category: [post.category], limit: 10 }).catch(
          () => [] as Post[],
        )
      : Promise.resolve([] as Post[]),
    getProfileByUsername(post.author.username).catch(() => null),
    listPostCommentsAction(post.id).catch(() => []),
  ]);
  const comments = buildCommentTree(rawComments);

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
    <div className="mx-auto flex w-full max-w-400 flex-col gap-8 px-4 py-6 pb-24 min-[1200px]:flex-row min-[1200px]:pb-6">
      {/* Cot TRAI - CHI desktop (>=1200px), doi dien voi ArticleSidebar (Muc
          luc) o cot phai theo yeu cau nguoi dung. Tu quyet dinh an/hien qua
          IntersectionObserver (xem component), tra ve null luc chua can
          hien nen khong can boc them dieu kien o day. Duoi 1200px (ke ca
          tablet) KHONG hien nua (khong co cho cho 1 cot rieng) - thanh hanh
          dong dinh duoi cung da dam nhiem vai tro "luon thay duoc" o do roi. */}
      <aside className="hidden w-64 shrink-0 min-[1200px]:block">
        <ArticleStickyAuthorBar
          author={post.author}
          profile={profile}
          isFollowing={profile?.isFollowing ?? false}
          isSelf={profile?.isSelf ?? false}
          authorCardId="article-author-card"
        />
      </aside>

      <div className="flex min-w-0 flex-1 flex-col gap-6 min-[1200px]:max-w-225">
        <ArticleHeader post={post} />

        {/* Muc luc thu gon, inline ngay duoi tieu de - CHI duoi 1200px (ke ca
            tablet). Tu 1200px tro len muc luc nam trong ArticleSidebar dinh
            ben phai thay the, an ban nay di. */}
        <div className="min-[1200px]:hidden">
          <ArticleTableOfContents content={content} richHeadings={rich?.headings} variant="inline" />
        </div>

        <ArticleBody post={post} richHtml={rich?.html} />

        {/* Thanh hanh dong: ban thuong (inline, sau than bai) CHI desktop
            (>=1200px) - duoi 1200px (ke ca tablet) thay bang ban dinh duoi
            cung man hinh (sticky, xem duoi cung trang) de luon bam duoc du
            cuon toi dau. */}
        <div className="hidden min-[1200px]:block">
          <ArticleActionBar
            likes={post.stats.likes}
            commentCount={post.stats.comments}
            postId={post.id}
            isOwner={post.isOwner ?? false}
          />
        </div>

        <ArticleAuthorCard
          author={post.author}
          bio={profile?.bio}
          followerCount={profile?.followerCount}
          profile={profile}
          isFollowing={profile?.isFollowing ?? false}
          isSelf={profile?.isSelf ?? false}
        />
        <ArticlePrevNextNav
          prev={prev && toSummary(prev)}
          next={next && toSummary(next)}
        />
        <ArticleComments postId={post.id} comments={comments} />
        <ArticleRecommendations
          moreFromAuthor={moreFromAuthor}
          related={related}
        />
      </div>

      <aside className="hidden w-72 shrink-0 min-[1200px]:block">
        <ArticleSidebar content={content} richHeadings={rich?.headings} related={related} />
      </aside>

      <div className="min-[1200px]:hidden">
        <ArticleActionBar
          likes={post.stats.likes}
          commentCount={post.stats.comments}
          postId={post.id}
          isOwner={post.isOwner ?? false}
          sticky
        />
      </div>
    </div>
  );
}
