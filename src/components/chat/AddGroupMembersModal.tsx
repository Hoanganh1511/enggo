"use client";

import { useEffect, useState, useTransition } from "react";
import { useSession } from "next-auth/react";
import * as Dialog from "@radix-ui/react-dialog";
import { Check, ChevronDown, LoaderCircle, Search, UserPlus, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "@/lib/toast/toast-store";
import { listConversationsAction } from "@/actions/chat/list-conversations";
import { searchUsersAction } from "@/actions/users/search-users";
import { getFollowingAction } from "@/actions/discover/follow-user";
import { addGroupMembersAction } from "@/actions/chat/group-info";
import type { ApiConversationSummary } from "@/lib/api/types";
import { ConversationAvatar } from "./ConversationAvatar";

type PickableUser = {
  id: string;
  username: string | null;
  name: string;
  avatarUrl: string | null;
};

// Them thanh vien vao 1 nhom DA CO SAN - cung UI/nguon du lieu (10 lien he
// gan nhat + following phan trang, tim kiem debounce) voi CreateGroupModal.tsx
// nhung KHONG co phan ten/mau nhom (nhom da co san roi) va toi thieu 1 nguoi
// (khong phai 2, vi day la THEM vao chu khong phai TAO moi). Loai san nhung
// ai DA la thanh vien (existingParticipantIds) khoi ca 3 nguon du lieu.
export function AddGroupMembersModal({
  open,
  onOpenChange,
  conversationId,
  existingParticipantIds,
  onAdded,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  conversationId: string;
  existingParticipantIds: string[];
  onAdded: (conversation: ApiConversationSummary) => void;
}) {
  const { data: session } = useSession();
  const [selected, setSelected] = useState<Map<string, PickableUser>>(
    new Map(),
  );
  const [query, setQuery] = useState("");
  const [recentContacts, setRecentContacts] = useState<PickableUser[] | null>(
    null,
  );
  const [followingItems, setFollowingItems] = useState<PickableUser[]>([]);
  const [followingCursor, setFollowingCursor] = useState<
    string | null | undefined
  >(undefined);
  const [loadingMore, setLoadingMore] = useState(false);
  const [searchResults, setSearchResults] = useState<PickableUser[] | null>(
    null,
  );
  const [searching, setSearching] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [, startFetchTransition] = useTransition();

  const existingIds = new Set(existingParticipantIds);

  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    startFetchTransition(async () => {
      const items = await listConversationsAction();
      if (cancelled) return;
      const recent = items
        .filter((c) => !c.isGroup && c.otherUser && !existingIds.has(c.otherUser.id))
        .slice(0, 10)
        .map((c) => c.otherUser!);
      setRecentContacts(recent);
    });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  useEffect(() => {
    if (!query.trim()) {
      startFetchTransition(() => setSearchResults(null));
      return;
    }
    let cancelled = false;
    const timer = setTimeout(() => {
      startFetchTransition(async () => {
        setSearching(true);
        try {
          const page = await searchUsersAction(query.trim());
          if (cancelled) return;
          setSearchResults(
            page.items
              .filter((u) => !existingIds.has(u.id))
              .map((u) => ({
                id: u.id,
                username: u.username,
                name: u.displayName,
                avatarUrl: u.avatarUrl,
              })),
          );
        } finally {
          if (!cancelled) setSearching(false);
        }
      });
    }, 350);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query]);

  async function handleLoadMore() {
    if (!session?.username || loadingMore) return;
    setLoadingMore(true);
    try {
      const page = await getFollowingAction(
        session.username,
        followingCursor ?? undefined,
      );
      setFollowingItems((prev) => [
        ...prev,
        ...page.items
          .filter((u) => !existingIds.has(u.id))
          .map((u) => ({
            id: u.id,
            username: u.username,
            name: u.displayName,
            avatarUrl: u.avatarUrl,
          })),
      ]);
      setFollowingCursor(page.nextCursor);
    } finally {
      setLoadingMore(false);
    }
  }

  function toggleSelect(user: PickableUser) {
    setSelected((prev) => {
      const next = new Map(prev);
      if (next.has(user.id)) next.delete(user.id);
      else next.set(user.id, user);
      return next;
    });
  }

  function reset() {
    setSelected(new Map());
    setQuery("");
    setRecentContacts(null);
    setFollowingItems([]);
    setFollowingCursor(undefined);
    setSearchResults(null);
  }

  async function handleSubmit() {
    if (selected.size === 0 || submitting) return;
    setSubmitting(true);
    try {
      const conversation = await addGroupMembersAction(
        conversationId,
        Array.from(selected.keys()),
      );
      onAdded(conversation);
      reset();
      onOpenChange(false);
    } catch {
      toast.danger("Không thể thêm thành viên, thử lại sau.");
    } finally {
      setSubmitting(false);
    }
  }

  const shownIds = new Set<string>();
  const browseList: PickableUser[] = [];
  for (const u of recentContacts ?? []) {
    if (shownIds.has(u.id)) continue;
    shownIds.add(u.id);
    browseList.push(u);
  }
  for (const u of followingItems) {
    if (shownIds.has(u.id)) continue;
    shownIds.add(u.id);
    browseList.push(u);
  }

  const isSearching = query.trim().length > 0;
  const displayList = isSearching ? (searchResults ?? []) : browseList;
  const canSubmit = selected.size > 0 && !submitting;

  return (
    <Dialog.Root
      open={open}
      onOpenChange={(next) => {
        if (!next) reset();
        onOpenChange(next);
      }}
    >
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-[#172033]/45 backdrop-blur-sm" />
        <Dialog.Content
          onOpenAutoFocus={(e) => e.preventDefault()}
          className="fixed top-1/2 left-1/2 z-50 flex max-h-[85vh] w-[calc(100%-2rem)] max-w-2xl -translate-x-1/2 -translate-y-1/2 flex-col overflow-hidden rounded-[22px] bg-white shadow-[0_28px_70px_-16px_rgba(23,32,51,.3)] focus:outline-none"
        >
          <div className="flex shrink-0 items-start justify-between gap-4 border-b border-[#E5E7EB] px-8 py-6">
            <div className="flex items-center gap-3.5">
              <span
                className="grid size-11 shrink-0 place-items-center rounded-2xl text-white"
                style={{ background: "linear-gradient(135deg, var(--primary), var(--primary-hover))" }}
              >
                <UserPlus size={21} />
              </span>
              <div>
                <Dialog.Title className="text-[22px] font-bold text-[#172033]">
                  Thêm thành viên
                </Dialog.Title>
                <Dialog.Description className="mt-0.5 text-[14px] text-[#7A8496]">
                  Thêm bạn bè vào nhóm này
                </Dialog.Description>
              </div>
            </div>
            <Dialog.Close asChild>
              <button
                type="button"
                aria-label="Đóng"
                className="grid size-9 shrink-0 cursor-pointer place-items-center rounded-full text-[#7A8496] transition-colors duration-150 ease-out hover:bg-primary-soft hover:text-primary"
              >
                <X size={18} />
              </button>
            </Dialog.Close>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto px-8 py-7">
            <div className="flex flex-col gap-8">
              {selected.size > 0 && (
                <div>
                  <p className="mb-3 text-[14px] font-semibold text-[#172033]">
                    Đã chọn ({selected.size})
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {Array.from(selected.values()).map((u) => (
                      <span
                        key={u.id}
                        className="flex items-center gap-2 rounded-full bg-[#F7F8FC] py-1.5 pr-2 pl-1.5 text-[13px] font-medium text-[#172033]"
                      >
                        <ConversationAvatar name={u.name} avatarUrl={u.avatarUrl} size={22} />
                        {u.name}
                        <button
                          type="button"
                          onClick={() => toggleSelect(u)}
                          className="grid size-4.5 shrink-0 cursor-pointer place-items-center rounded-full text-[#7A8496] transition-colors duration-150 ease-out hover:bg-[#E5E7EB] hover:text-[#172033]"
                        >
                          <X size={11} />
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div className="relative">
                <Search
                  size={17}
                  className="pointer-events-none absolute top-1/2 left-4 -translate-y-1/2 text-[#7A8496]"
                />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Tìm kiếm bạn bè..."
                  className="h-13 w-full rounded-[14px] border border-[#E5E7EB] bg-white pr-4 pl-11 text-[15px] text-[#172033] outline-none transition-colors duration-150 ease-out placeholder:text-[#7A8496] focus:border-primary"
                />
              </div>

              <div>
                <p className="mb-2 text-[14px] font-semibold text-[#172033]">
                  {isSearching ? "Kết quả tìm kiếm" : "Bạn bè gợi ý"}
                </p>
                <div className="flex flex-col">
                  {recentContacts === null ? (
                    <div className="flex justify-center py-8">
                      <LoaderCircle size={20} className="animate-spin text-[#7A8496]" />
                    </div>
                  ) : displayList.length === 0 ? (
                    <p className="py-8 text-center text-[13px] text-[#7A8496]">
                      {searching
                        ? "Đang tìm..."
                        : "Không tìm thấy ai để thêm."}
                    </p>
                  ) : (
                    displayList.map((u) => {
                      const isSelected = selected.has(u.id);
                      return (
                        <button
                          key={u.id}
                          type="button"
                          onClick={() => toggleSelect(u)}
                          className="flex h-16 w-full shrink-0 cursor-pointer items-center gap-3 rounded-xl px-3 text-left transition-colors duration-150 ease-out hover:bg-[#F7F8FC]"
                        >
                          <ConversationAvatar name={u.name} avatarUrl={u.avatarUrl} size={42} />
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-[15px] font-medium text-[#172033]">
                              {u.name}
                            </p>
                            {u.username && (
                              <p className="truncate text-[13px] text-[#7A8496]">
                                @{u.username}
                              </p>
                            )}
                          </div>
                          <span
                            className={cn(
                              "grid size-6 shrink-0 place-items-center rounded-md border transition-colors duration-150 ease-out",
                              isSelected
                                ? "border-primary bg-primary text-white"
                                : "border-[#E5E7EB] bg-white",
                            )}
                          >
                            {isSelected && <Check size={14} strokeWidth={3} />}
                          </span>
                        </button>
                      );
                    })
                  )}
                  {!isSearching && recentContacts !== null && followingCursor !== null && (
                    <button
                      type="button"
                      onClick={() => void handleLoadMore()}
                      disabled={loadingMore}
                      className="mt-1 flex cursor-pointer items-center justify-center gap-1 py-3 text-[13px] font-semibold text-primary transition-opacity duration-150 ease-out disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {loadingMore ? "Đang tải..." : "Xem thêm"}
                      {!loadingMore && <ChevronDown size={15} />}
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="flex shrink-0 items-center justify-end gap-3 border-t border-[#E5E7EB] px-8 py-5">
            <Dialog.Close asChild>
              <button
                type="button"
                className="h-12 cursor-pointer rounded-[14px] bg-[#F7F8FC] px-5 text-[15px] font-semibold text-[#4B5565] transition-colors duration-150 ease-out hover:bg-[#E5E7EB]"
              >
                Hủy
              </button>
            </Dialog.Close>
            <button
              type="button"
              onClick={() => void handleSubmit()}
              disabled={!canSubmit}
              className="h-12 cursor-pointer rounded-[14px] px-6 text-[15px] font-semibold text-white shadow-[0_10px_24px_-8px_rgba(221,112,11,.55)] transition-opacity duration-150 ease-out disabled:cursor-not-allowed disabled:opacity-45"
              style={{ background: "linear-gradient(135deg, var(--primary), var(--primary-hover))" }}
            >
              {submitting
                ? "Đang thêm..."
                : `Thêm${selected.size > 0 ? ` (${selected.size})` : ""}`}
            </button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
