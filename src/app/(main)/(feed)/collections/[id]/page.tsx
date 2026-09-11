import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, Folder, Lock } from "lucide-react";
import { getCollectionDetailAction } from "@/actions/discover/collections/get-collection-detail";
import { NoteCard } from "@/components/discover/home-feed/NoteCard";
import { EditCollectionButton } from "@/components/collections/EditCollectionButton";
import { formatRelativeTime } from "@/lib/format-time";
import { ApiError } from "@/lib/api/client";

// Trang chi tiet 1 bo suu tap - 404 neu Rieng tu + khong phai chu (xem
// PostCollectionService.getDetail o backend). "Chỉnh sửa" chi hien khi
// isOwner (backend tra kem field nay, khong tu suy tren client).
export default async function CollectionDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  let collection;
  try {
    collection = await getCollectionDetailAction(id);
  } catch (e) {
    if (e instanceof ApiError && e.status === 404) notFound();
    throw e;
  }

  return (
    <div className="w-full">
      <Link
        href="/collections"
        className="inline-flex items-center gap-1.5 text-sm text-[var(--muted)] transition-colors duration-150 ease-out hover:text-[var(--foreground)]"
      >
        <ArrowLeft size={15} strokeWidth={2} />
        Quay lại
      </Link>

      <div className="mt-4 overflow-hidden rounded-xl">
        <div className="relative aspect-[3/1] w-full overflow-hidden bg-slate-100">
          {collection.coverImageUrl ? (
            <Image
              src={collection.coverImageUrl}
              alt=""
              fill
              priority
              className="object-cover"
            />
          ) : (
            <div className="flex size-full items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200 text-slate-400">
              <Folder size={32} strokeWidth={1.6} />
            </div>
          )}
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <h1 className="font-content text-2xl font-bold text-[var(--foreground)]">
            {collection.title}
          </h1>
          {collection.description && (
            <p className="font-content mt-1.5 text-sm text-[var(--muted)]">
              {collection.description}
            </p>
          )}
          <div className="mt-2.5 flex flex-wrap items-center gap-1.5 text-xs text-[var(--muted)]">
            <span>{collection.postCount} bài viết</span>
            <span aria-hidden="true">·</span>
            <span className="flex items-center gap-1">
              {collection.visibility === "private" && (
                <Lock size={11} strokeWidth={2} />
              )}
              {collection.visibility === "private" ? "Riêng tư" : "Công khai"}
            </span>
            <span aria-hidden="true">·</span>
            <span>Cập nhật {formatRelativeTime(collection.updatedAt)}</span>
          </div>
        </div>
        {collection.isOwner && <EditCollectionButton collection={collection} />}
      </div>

      {collection.posts.length === 0 ? (
        <div className="mt-8 flex flex-col items-center gap-2 rounded-xl border border-dashed border-[var(--border)] py-16 text-center">
          <Folder size={20} strokeWidth={1.6} className="text-[var(--muted)]" />
          <p className="text-sm font-semibold text-[var(--foreground)]">
            Bộ sưu tập này chưa có bài viết nào.
          </p>
        </div>
      ) : (
        <div className="mt-8 grid grid-cols-1 gap-x-5 gap-y-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {collection.posts.map((post) => (
            <NoteCard
              key={post.id}
              post={post}
              className="w-full"
              sizes="(min-width: 1280px) 25vw, (min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
            />
          ))}
        </div>
      )}
    </div>
  );
}
