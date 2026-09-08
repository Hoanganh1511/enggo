import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { Bookmark, FileText } from "lucide-react";
import type { NormalizedPost } from "@/lib/discover/normalize-post";
import { formatDate } from "@/lib/format-time";

export function HomeArticleCard({ post, index }: { post: NormalizedPost; index: number }) {
  const topicLabel = post.categorySlug.replace(/-/g, " ") || "Chia sẻ chung";

  return (
    <motion.article
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      whileHover={{ y: -3 }}
      className="overflow-hidden rounded-xl border border-[#edf0f4] bg-white transition hover:shadow-md"
    >
      <Link href={`/p/${post.id}`}>
        <div className="relative h-[135px] bg-slate-100">
          {post.image ? (
            <Image src={post.image} alt="" fill className="object-cover" />
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-slate-100 to-slate-200" />
          )}
          {/* Chua co tinh nang luu bai that (xem tab "Bookmarks" disabled o
              HomeArticleSection.tsx) - la 1 nut THAT se long trong <Link>
              bao ngoai (HTML khong hop le, 2 interactive element long nhau),
              nen de decorative + aria-hidden thay vi gia vo la control bam
              duoc. */}
          <span
            aria-hidden="true"
            className="absolute top-4 right-4 rounded-md bg-white/80 p-1.5"
          >
            <Bookmark size={15} className="text-slate-600" />
          </span>
        </div>
        {/* font-content: tieu de/mo ta/thong tin bai la NOI DUNG, dung
            Manrope thay --font-sans mac dinh (UI/dieu huong). */}
        <div className="font-content p-4">
          <span className="rounded-full bg-blue-50 px-2.5 py-1 text-[11px] font-medium text-blue-600 capitalize">
            {topicLabel}
          </span>
          <h3 className="mt-3 line-clamp-2 text-[16px] leading-5 font-bold">{post.title}</h3>
          {post.excerpt && (
            <p className="mt-2 line-clamp-2 text-[12px] leading-5 text-slate-500">
              {post.excerpt}
            </p>
          )}
          <div className="mt-4 flex items-center justify-between text-[11px] text-slate-400">
            <span>
              {post.author.name} · {formatDate(post.createdAt)}
            </span>
            <span className="flex items-center gap-1">
              <FileText size={11} />
              {post.commentCount}
            </span>
          </div>
        </div>
      </Link>
    </motion.article>
  );
}
