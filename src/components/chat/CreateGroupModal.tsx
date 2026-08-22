"use client";

import { useEffect, useState, useTransition } from "react";
import { useSession } from "next-auth/react";
import { Check, LoaderCircle, Search, X } from "lucide-react";
import { SimpleModal } from "@/components/ui/simple-modal";
import { cn } from "@/lib/utils";
import { toast } from "@/lib/toast/toast-store";
import { listConversationsAction } from "@/actions/chat/list-conversations";
import { searchUsersAction } from "@/actions/users/search-users";
import { getFollowingAction } from "@/actions/discover/follow-user";
import { createGroupConversationAction } from "@/actions/chat/create-group-conversation";
import {
  GROUP_AVATAR_COLORS,
  type ApiConversationSummary,
  type GroupAvatarColor,
} from "@/lib/api/types";
import { GroupAvatar } from "./GroupAvatar";
import { ConversationAvatar } from "./ConversationAvatar";

type PickableUser = {
  id: string;
  username: string | null;
  name: string;
  avatarUrl: string | null;
};

const GROUP_COLOR_SWATCHES: Record<GroupAvatarColor, string> = {
  violet: "#7c3aed",
  blue: "#2563eb",
  emerald: "#059669",
  amber: "#d97706",
  rose: "#e11d48",
  slate: "#475569",
};

// Modal tao nhom chat - avatar CHUA co upload that (chon 1 trong 6 mau co
// dinh, xem GroupAvatar.tsx), chip nguoi da chon o tren (go duoc), input
// tim kiem, danh sach ben duoi mac dinh la 10 lien he gan nhat (tu
// listConversationsAction, loc hoi thoai 1-1), "Xem thêm" tai dan theo
// following (getFollowingAction, phan trang) - go vao o tim kiem thi chuyen
// sang ket qua tim kiem nguoi dung (searchUsersAction) thay vi 2 nguon tren.
export function CreateGroupModal({
  open,
  onOpenChange,
  onCreated,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated: (conversation: ApiConversationSummary) => void;
}) {
  const { data: session } = useSession();
  const [name, setName] = useState("");
  const [avatarColor, setAvatarColor] = useState<GroupAvatarColor>(
    GROUP_AVATAR_COLORS[0],
  );
  const [selected, setSelected] = useState<Map<string, PickableUser>>(
    new Map(),
  );
  const [query, setQuery] = useState("");
  const [recentContacts, setRecentContacts] = useState<PickableUser[] | null>(
    null,
  );
  const [followingItems, setFollowingItems] = useState<PickableUser[]>([]);
  // undefined = chua tung goi following (van hien nut "Xem them"), null =
  // da het trang, string = con trang tiep theo.
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

  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    startFetchTransition(async () => {
      const items = await listConversationsAction();
      if (cancelled) return;
      const recent = items
        .filter((c) => !c.isGroup && c.otherUser)
        .slice(0, 10)
        .map((c) => c.otherUser!);
      setRecentContacts(recent);
    });
    return () => {
      cancelled = true;
    };
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
            page.items.map((u) => ({
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
        ...page.items.map((u) => ({
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
    setName("");
    setAvatarColor(GROUP_AVATAR_COLORS[0]);
    setSelected(new Map());
    setQuery("");
    setRecentContacts(null);
    setFollowingItems([]);
    setFollowingCursor(undefined);
    setSearchResults(null);
  }

  async function handleSubmit() {
    if (selected.size < 2 || !name.trim() || submitting) return;
    setSubmitting(true);
    try {
      const conversation = await createGroupConversationAction(
        name.trim(),
        Array.from(selected.keys()),
        avatarColor,
      );
      onCreated(conversation);
      reset();
      onOpenChange(false);
    } catch {
      toast.danger("Không thể tạo nhóm, thử lại sau.");
    } finally {
      setSubmitting(false);
    }
  }

  // Nguon "duyet" (khong tim kiem) = recentContacts noi tiep followingItems,
  // loai trung theo id (following co the tra lai nguoi da co trong recent).
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
  const canSubmit = name.trim().length > 0 && selected.size >= 2 && !submitting;

  return (
    <SimpleModal
      open={open}
      onOpenChange={(next) => {
        if (!next) reset();
        onOpenChange(next);
      }}
      title="Tạo nhóm chat"
      maxWidthClassName="max-w-md"
      footer={
        <button
          type="button"
          onClick={() => void handleSubmit()}
          disabled={!canSubmit}
          className="w-full cursor-pointer rounded-xl px-4 py-2.5 text-sm font-semibold text-white transition-opacity duration-150 ease-out disabled:cursor-not-allowed disabled:opacity-50"
          style={{ background: "var(--primary)" }}
        >
          {submitting
            ? "Đang tạo..."
            : `Tạo nhóm${selected.size > 0 ? ` (${selected.size + 1})` : ""}`}
        </button>
      }
    >
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-3">
          <GroupAvatar color={avatarColor} size={56} />
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            maxLength={50}
            placeholder="Tên nhóm"
            className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-ink outline-none focus:border-primary"
          />
        </div>

        <div className="flex items-center gap-2">
          {GROUP_AVATAR_COLORS.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setAvatarColor(c)}
              aria-label={`Chọn màu ${c}`}
              className={cn(
                "size-6 shrink-0 cursor-pointer rounded-full transition-shadow",
                avatarColor === c && "ring-2 ring-ink ring-offset-2",
              )}
              style={{ background: GROUP_COLOR_SWATCHES[c] }}
            />
          ))}
        </div>

        {selected.size > 0 && (
          <div className="flex flex-wrap gap-2">
            {Array.from(selected.values()).map((u) => (
              <span
                key={u.id}
                className="flex items-center gap-1.5 rounded-full bg-hover-bg py-1 pr-1 pl-2 text-xs font-medium text-[#182338]"
              >
                {u.name}
                <button
                  type="button"
                  onClick={() => toggleSelect(u)}
                  className="grid size-4 cursor-pointer place-items-center rounded-full hover:bg-active-bg"
                >
                  <X size={11} />
                </button>
              </span>
            ))}
          </div>
        )}

        <div className="flex h-10 shrink-0 items-center gap-2 rounded-lg border border-border bg-surface px-3">
          <Search size={15} className="shrink-0 text-ink-faint" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Tìm người dùng..."
            className="w-full bg-transparent text-sm text-ink outline-none placeholder:text-ink-faint"
          />
        </div>

        <div className="flex max-h-64 flex-col gap-0.5 overflow-y-auto">
          {recentContacts === null ? (
            <div className="flex justify-center py-6">
              <LoaderCircle size={18} className="animate-spin text-ink-faint" />
            </div>
          ) : displayList.length === 0 ? (
            <p className="py-6 text-center text-xs text-ink-faint">
              {searching ? "Đang tìm..." : "Không tìm thấy ai."}
            </p>
          ) : (
            displayList.map((u) => {
              const isSelected = selected.has(u.id);
              return (
                <button
                  key={u.id}
                  type="button"
                  onClick={() => toggleSelect(u)}
                  className="flex cursor-pointer items-center gap-3 rounded-lg px-2 py-2 text-left hover:bg-hover-bg"
                >
                  <ConversationAvatar name={u.name} avatarUrl={u.avatarUrl} size={36} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-ink">{u.name}</p>
                    {u.username && (
                      <p className="truncate text-xs text-ink-faint">
                        @{u.username}
                      </p>
                    )}
                  </div>
                  <span
                    className={cn(
                      "grid size-5 shrink-0 place-items-center rounded-md border",
                      isSelected
                        ? "border-primary bg-primary text-white"
                        : "border-border",
                    )}
                  >
                    {isSelected && <Check size={13} />}
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
              className="cursor-pointer py-2 text-center text-xs font-semibold text-primary disabled:opacity-60"
            >
              {loadingMore ? "Đang tải..." : "Xem thêm"}
            </button>
          )}
        </div>
      </div>
    </SimpleModal>
  );
}
