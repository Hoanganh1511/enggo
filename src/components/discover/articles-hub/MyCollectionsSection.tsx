"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Folder, Lock, Plus } from "lucide-react";
import { CreateCollectionModal } from "@/components/collections/CreateCollectionModal";
import { ScrollableRow } from "./ScrollableRow";
import type { PostCollectionApiShape } from "@/lib/api/collections";

// Khu "Bộ sưu tập của tôi" tren /collections ("Bo suu tap cua moi nguoi") -
// dat TRUOC luoi kham pha cong dong, chi hien khi da dang nhap (viewerUsername
// khac null). Du lieu THAT qua listMyCollectionsAction (thay ca Rieng tu cua
// chinh minh, khac listPublicCollectionsAction chi tra Cong khai). The GON
// hon CollectionBrowseCard.tsx (khong co hang chu so huu/nut Theo doi vi la
// CHINH MINH) - dung token dashboard-scope (var(--...)) khop phan con lai
// trang, KHONG dung lai CollectionsGrid.tsx/CollectionCard.tsx cu (dung token
// app chinh --ink/--border, se lac tong voi khu vuc nay).
export function MyCollectionsSection({
  username,
  initialCollections,
}: {
  username: string;
  initialCollections: PostCollectionApiShape[];
}) {
  const [collections, setCollections] = useState(initialCollections);
  const [createOpen, setCreateOpen] = useState(false);

  return (
    <div className="mt-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="min-w-0">
          <h2 className="text-[17px] font-bold text-[var(--foreground)]">
            Bộ sưu tập của tôi
          </h2>
          <p className="text-[12.5px] text-[var(--muted)]">
            Riêng tư lẫn công khai, chỉ mình bạn thấy đầy đủ ở đây.
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <Link
            href={`/u/${username}/collections`}
            className="text-[13px] font-medium text-[var(--primary)] transition hover:opacity-80"
          >
            Quản lý tất cả
          </Link>
          <button
            type="button"
            onClick={() => setCreateOpen(true)}
            className="flex h-9 shrink-0 cursor-pointer items-center gap-1.5 rounded-full bg-[var(--foreground)] px-3.5 text-[13px] font-semibold text-white transition-opacity duration-150 ease-out hover:opacity-90"
          >
            <Plus size={14} strokeWidth={2.5} />
            Tạo bộ sưu tập
          </button>
        </div>
      </div>

      {collections.length === 0 ? (
        <div className="mt-4 flex flex-col items-center gap-2 rounded-xl border border-dashed border-[var(--border)] py-10 text-center">
          <Folder size={20} strokeWidth={1.6} className="text-[var(--muted)]" />
          <p className="text-sm font-semibold text-[var(--foreground)]">
            Bạn chưa có bộ sưu tập nào.
          </p>
          <button
            type="button"
            onClick={() => setCreateOpen(true)}
            className="mt-1 flex h-9 cursor-pointer items-center gap-1.5 rounded-full bg-[var(--foreground)] px-4 text-sm font-semibold text-white transition-opacity duration-150 ease-out hover:opacity-90"
          >
            <Plus size={14} strokeWidth={2.5} />
            Tạo bộ sưu tập
          </button>
        </div>
      ) : (
        <div className="mt-4">
          <ScrollableRow gapClassName="gap-3.5">
            {collections.map((c) => (
              <Link
                key={c.id}
                href={`/collections/${c.id}`}
                className="w-64 shrink-0 overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--surface)] shadow-[var(--shadow-card)] transition-shadow duration-200 ease-out hover:shadow-[var(--shadow-hover)]"
              >
                <div className="relative aspect-video w-full overflow-hidden bg-[var(--surface-subtle)]">
                  {c.coverImageUrl ? (
                    <Image src={c.coverImageUrl} alt="" fill className="object-cover" />
                  ) : (
                    <div className="flex size-full items-center justify-center text-[var(--muted)]">
                      <Folder size={24} strokeWidth={1.6} />
                    </div>
                  )}
                  {c.visibility === "private" && (
                    <span className="absolute top-2 right-2 flex items-center gap-1 rounded-full bg-black/55 px-2 py-1 text-[10px] font-medium text-white">
                      <Lock size={10} strokeWidth={2} />
                      Riêng tư
                    </span>
                  )}
                </div>
                <div className="font-content p-3.5">
                  <h3 className="line-clamp-1 text-[13.5px] font-bold text-[var(--foreground)]">
                    {c.title}
                  </h3>
                  <p className="mt-1 text-[11px] text-[var(--muted)]">
                    {c.postCount} bài viết
                  </p>
                </div>
              </Link>
            ))}
          </ScrollableRow>
        </div>
      )}

      <CreateCollectionModal
        open={createOpen}
        onOpenChange={setCreateOpen}
        onCreated={(created) => {
          setCollections((prev) => [created, ...prev]);
          setCreateOpen(false);
        }}
      />
    </div>
  );
}
