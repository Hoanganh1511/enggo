"use client";

import { useState } from "react";
import { Folder, Plus } from "lucide-react";
import { CollectionCard } from "./CollectionCard";
import { CreateCollectionModal } from "./CreateCollectionModal";
import type { PostCollectionApiShape } from "@/lib/api/collections";

// Luoi bo suu tap - dung CHUNG cho /collections (cua minh, canCreate=true)
// va /u/[username]/collections (cua nguoi khac, canCreate=false vi khong
// phai chu). Khac ProfileArticleGrid.tsx (render Post) - day render
// PostCollection, entity khac han nen KHONG tai dung duoc component do.
export function CollectionsGrid({
  heading,
  description,
  collections: initialCollections,
  canCreate,
}: {
  heading: string;
  description?: string;
  collections: PostCollectionApiShape[];
  canCreate: boolean;
}) {
  const [collections, setCollections] = useState(initialCollections);
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <div>
      <div className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <h2 className="text-lg font-bold text-ink">{heading}</h2>
          {description && (
            <p className="mt-0.5 text-[13px] text-ink-faint">{description}</p>
          )}
        </div>
        {canCreate && (
          <button
            type="button"
            onClick={() => setModalOpen(true)}
            className="flex h-9 shrink-0 cursor-pointer items-center gap-1.5 rounded-full bg-ink px-3.5 text-sm font-semibold text-surface transition-opacity duration-150 ease-out hover:opacity-90"
          >
            <Plus size={14} strokeWidth={2.5} />
            Tạo bộ sưu tập
          </button>
        )}
      </div>

      {collections.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-border py-16 text-center">
          <div className="flex size-12 items-center justify-center rounded-full bg-surface-muted text-ink-faint">
            <Folder size={20} strokeWidth={1.6} />
          </div>
          <div>
            <p className="text-sm font-semibold text-ink">
              Chưa có bộ sưu tập nào.
            </p>
            {canCreate && (
              <p className="mt-1 text-xs text-ink-faint">
                Gom các bài viết cùng chủ đề lại một chỗ để dễ tìm lại sau.
              </p>
            )}
          </div>
          {canCreate && (
            <button
              type="button"
              onClick={() => setModalOpen(true)}
              className="mt-1 flex h-9 items-center gap-1.5 rounded-full bg-ink px-4 text-sm font-semibold text-surface transition-opacity duration-150 ease-out hover:opacity-90"
            >
              <Plus size={14} strokeWidth={2.5} />
              Tạo bộ sưu tập
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 pb-5 sm:grid-cols-2 lg:grid-cols-4">
          {collections.map((c) => (
            <CollectionCard key={c.id} collection={c} />
          ))}
        </div>
      )}

      {canCreate && (
        <CreateCollectionModal
          open={modalOpen}
          onOpenChange={setModalOpen}
          onCreated={(created) => setCollections((prev) => [created, ...prev])}
        />
      )}
    </div>
  );
}
