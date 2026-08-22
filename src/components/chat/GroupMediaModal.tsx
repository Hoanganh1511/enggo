"use client";

import { useEffect, useState, useTransition } from "react";
import Image from "next/image";
import * as Dialog from "@radix-ui/react-dialog";
import { ChevronDown, FileIcon, FolderOpen, LoaderCircle, X } from "lucide-react";
import type { ApiChatMessage } from "@/lib/api/types";
import { listMediaAction } from "@/actions/chat/group-info";

// Luoi file/media day du, phan trang cursor (xem ChatService.listMedia o
// backend) - reuse listMediaAction, KHONG lazy-load infinite scroll de don
// gian, dung nut "Xem thêm" nhu CreateGroupModal.tsx.
export function GroupMediaModal({
  open,
  onOpenChange,
  conversationId,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  conversationId: string;
}) {
  const [items, setItems] = useState<ApiChatMessage[] | null>(null);
  const [cursor, setCursor] = useState<string | null | undefined>(undefined);
  const [loadingMore, setLoadingMore] = useState(false);
  const [, startFetchTransition] = useTransition();

  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    startFetchTransition(() => {
      setItems(null);
      setCursor(undefined);
    });
    listMediaAction(conversationId).then((page) => {
      if (cancelled) return;
      setItems(page.items);
      setCursor(page.nextCursor);
    });
    return () => {
      cancelled = true;
    };
  }, [open, conversationId]);

  async function handleLoadMore() {
    if (!cursor || loadingMore) return;
    setLoadingMore(true);
    try {
      const page = await listMediaAction(conversationId, cursor);
      setItems((prev) => [...(prev ?? []), ...page.items]);
      setCursor(page.nextCursor);
    } finally {
      setLoadingMore(false);
    }
  }

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-[#172033]/45 backdrop-blur-sm" />
        <Dialog.Content
          onOpenAutoFocus={(e) => e.preventDefault()}
          className="fixed top-1/2 left-1/2 z-50 flex max-h-[80vh] w-[calc(100%-2rem)] max-w-lg -translate-x-1/2 -translate-y-1/2 flex-col overflow-hidden rounded-[22px] bg-white shadow-[0_28px_70px_-16px_rgba(23,32,51,.3)] focus:outline-none"
        >
          <div className="flex shrink-0 items-center justify-between gap-4 border-b border-[#E5E7EB] px-6 py-5">
            <div className="flex items-center gap-3">
              <span
                className="grid size-9 shrink-0 place-items-center rounded-xl text-white"
                style={{ background: "linear-gradient(135deg, var(--primary), var(--primary-hover))" }}
              >
                <FolderOpen size={17} />
              </span>
              <Dialog.Title className="text-[17px] font-bold text-[#172033]">
                File & Media
              </Dialog.Title>
            </div>
            <Dialog.Close asChild>
              <button
                type="button"
                aria-label="Đóng"
                className="grid size-8 shrink-0 cursor-pointer place-items-center rounded-full text-[#7A8496] transition-colors duration-150 ease-out hover:bg-primary-soft hover:text-primary"
              >
                <X size={16} />
              </button>
            </Dialog.Close>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto px-6 py-5">
            {items === null ? (
              <div className="flex justify-center py-10">
                <LoaderCircle size={20} className="animate-spin text-[#7A8496]" />
              </div>
            ) : items.length === 0 ? (
              <p className="py-10 text-center text-[13px] text-[#7A8496]">
                Chưa có file/media nào được chia sẻ.
              </p>
            ) : (
              <>
                <div className="grid grid-cols-3 gap-2">
                  {items.map((m) =>
                    (m.type === "IMAGE" || m.type === "GIF") && m.attachmentUrl ? (
                      <a
                        key={m.id}
                        href={m.attachmentUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="aspect-square overflow-hidden rounded-xl bg-[#F7F8FC]"
                      >
                        <Image
                          src={m.attachmentUrl}
                          alt=""
                          width={120}
                          height={120}
                          className="size-full object-cover"
                        />
                      </a>
                    ) : (
                      <a
                        key={m.id}
                        href={m.attachmentUrl ?? undefined}
                        target="_blank"
                        rel="noreferrer"
                        className="flex aspect-square flex-col items-center justify-center gap-1.5 rounded-xl bg-[#F7F8FC] p-2 text-center"
                      >
                        <FileIcon size={20} className="text-[#7A8496]" />
                        <span className="line-clamp-2 text-[11px] text-[#172033]">
                          {m.attachmentName ?? "Tệp đính kèm"}
                        </span>
                      </a>
                    ),
                  )}
                </div>
                {cursor && (
                  <button
                    type="button"
                    onClick={() => void handleLoadMore()}
                    disabled={loadingMore}
                    className="mt-4 flex w-full cursor-pointer items-center justify-center gap-1 py-2.5 text-[13px] font-semibold text-primary transition-opacity duration-150 ease-out disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {loadingMore ? "Đang tải..." : "Xem thêm"}
                    {!loadingMore && <ChevronDown size={15} />}
                  </button>
                )}
              </>
            )}
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
