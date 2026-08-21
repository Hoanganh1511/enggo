"use client";

import {
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
  useTransition,
} from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { Layers, X } from "lucide-react";
import {
  clearChatToasts,
  dismissChatToast,
  getChatToastsSnapshot,
  getServerSnapshot,
  subscribeChatToasts,
  type ChatToastItem,
} from "@/lib/chat-toast/chat-toast-store";
import { formatRelativeTime } from "@/lib/format-time";

const AUTO_DISMISS_MS = 10000;
const MAX_VISIBLE_PEEK = 3;
const MAX_EXPANDED = 5;

// Chong toast tin nhan den (goc tren-phai, duoi header) - TopHeaderBar.tsx
// day item vao day khi nhan "chat:message" MA khong dang o trang /messages
// (dang o /messages thi da thay tin nhan song trong khung chat roi, khong
// can toast trung lap). Mac dinh hien kieu "chong the" (toi da 3 the ho
// nhau) - bam "Xem tat ca" xoe thanh danh sach doc (toi da 5 tin moi nhat).
// Bam vao 1 item -> dieu huong /messages?c=<id>. Tu dong bien mat sau 10s
// neu khong tuong tac (khac han toast thuong o toast-store.ts, o day can
// giu lau hon vi la thong bao co hanh dong ke tiep, khong phai thong bao
// suong).
export function ChatMessageToastStack() {
  const items = useSyncExternalStore(
    subscribeChatToasts,
    getChatToastsSnapshot,
    getServerSnapshot,
  );
  const [expanded, setExpanded] = useState(false);
  const router = useRouter();
  const scheduledRef = useRef<Set<string>>(new Set());
  const [, startTransition] = useTransition();

  useEffect(() => {
    for (const item of items) {
      if (scheduledRef.current.has(item.id)) continue;
      scheduledRef.current.add(item.id);
      setTimeout(() => {
        dismissChatToast(item.id);
        scheduledRef.current.delete(item.id);
      }, AUTO_DISMISS_MS);
    }
  }, [items]);

  // Boc trong startTransition (cung pattern voi cac cho khac trong app) de
  // setExpanded khong bi ESLint react-hooks/set-state-in-effect chan.
  useEffect(() => {
    if (items.length === 0) startTransition(() => setExpanded(false));
  }, [items.length]);

  if (items.length === 0) return null;

  function handleOpen(item: ChatToastItem) {
    dismissChatToast(item.id);
    setExpanded(false);
    router.push(`/messages?c=${item.conversationId}`);
  }

  const visiblePeek = items.slice(0, MAX_VISIBLE_PEEK);
  const expandedList = items.slice(0, MAX_EXPANDED);

  return (
    <div className="fixed top-20 right-4 z-50 w-80">
      <AnimatePresence mode="wait">
        {expanded ? (
          <motion.div
            key="expanded"
            initial={{ opacity: 0, scale: 0.95, y: -4 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -4 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_8px_28px_rgba(15,23,42,.14)]"
          >
            <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
              <b className="text-[13px] text-[#182338]">
                Tin nhắn mới ({items.length})
              </b>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => clearChatToasts()}
                  className="cursor-pointer text-[12px] font-medium text-slate-400 hover:text-slate-600"
                >
                  Xoá tất cả
                </button>
                <button
                  type="button"
                  onClick={() => setExpanded(false)}
                  className="cursor-pointer text-[12px] font-medium"
                  style={{ color: "var(--primary)" }}
                >
                  Thu gọn
                </button>
              </div>
            </div>
            <ul className="max-h-90 overflow-y-auto">
              <AnimatePresence initial={false}>
                {expandedList.map((item) => (
                  <motion.li
                    key={item.id}
                    layout
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.15, ease: "easeOut" }}
                  >
                    <ChatToastRow
                      item={item}
                      onOpen={() => handleOpen(item)}
                      onDismiss={() => dismissChatToast(item.id)}
                    />
                  </motion.li>
                ))}
              </AnimatePresence>
            </ul>
          </motion.div>
        ) : (
          <motion.div
            key="stack"
            initial={{ opacity: 0, scale: 0.95, y: -4 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -4 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className="relative"
            style={{ height: 72 + (visiblePeek.length - 1) * 8 }}
          >
            {visiblePeek
              .slice()
              .reverse()
              .map((item, revIdx) => {
                const idx = visiblePeek.length - 1 - revIdx; // 0 = the tren cung
                const isTop = idx === 0;
                return (
                  <div
                    key={item.id}
                    className="absolute inset-x-0 top-0 rounded-2xl border border-slate-200 bg-white shadow-[0_6px_20px_rgba(15,23,42,.1)]"
                    style={{
                      transform: `translateY(${idx * 8}px) scale(${1 - idx * 0.035})`,
                      zIndex: 10 - idx,
                      opacity: 1 - idx * 0.18,
                    }}
                  >
                    {isTop ? (
                      <ChatToastRow
                        item={item}
                        onOpen={() => handleOpen(item)}
                        onDismiss={() => dismissChatToast(item.id)}
                      />
                    ) : (
                      <div className="h-18" />
                    )}
                  </div>
                );
              })}
          </motion.div>
        )}
      </AnimatePresence>

      {!expanded && items.length > 1 && (
        <button
          type="button"
          onClick={() => setExpanded(true)}
          className="mt-2 flex w-full cursor-pointer items-center justify-center gap-1.5 rounded-full border border-slate-200 bg-white py-1.5 text-[12px] font-semibold text-slate-600 shadow-[0_4px_14px_rgba(15,23,42,.08)] hover:bg-slate-50"
        >
          <Layers size={13} />
          Xem tất cả ({items.length})
        </button>
      )}
    </div>
  );
}

function ChatToastRow({
  item,
  onOpen,
  onDismiss,
}: {
  item: ChatToastItem;
  onOpen: () => void;
  onDismiss: () => void;
}) {
  return (
    <div className="flex items-center gap-3 px-4 py-3 transition-colors duration-150 ease-out hover:bg-slate-50">
      <button
        type="button"
        onClick={onOpen}
        className="flex min-w-0 flex-1 cursor-pointer items-center gap-3 text-left"
      >
        <ChatToastAvatar name={item.senderName} avatarUrl={item.senderAvatarUrl} />
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-2">
            <b className="truncate text-[13px] text-[#182338]">
              {item.senderName}
            </b>
            <span className="shrink-0 text-[10px] text-slate-400">
              {formatRelativeTime(item.createdAt)}
            </span>
          </div>
          <p className="truncate text-[12px] text-slate-500">{item.preview}</p>
        </div>
      </button>
      <button
        type="button"
        onClick={onDismiss}
        aria-label="Bỏ qua"
        className="shrink-0 cursor-pointer rounded-full p-1 text-slate-300 hover:bg-slate-100 hover:text-slate-500"
      >
        <X size={13} />
      </button>
    </div>
  );
}

function ChatToastAvatar({
  name,
  avatarUrl,
}: {
  name: string;
  avatarUrl: string | null;
}) {
  if (avatarUrl) {
    return (
      <Image
        src={avatarUrl}
        alt={name}
        width={36}
        height={36}
        className="size-9 shrink-0 rounded-full object-cover"
      />
    );
  }
  return (
    <span
      className="grid size-9 shrink-0 place-items-center rounded-full text-[13px] font-semibold text-white"
      style={{ background: "var(--primary)" }}
    >
      {name.trim().charAt(0).toUpperCase() || "?"}
    </span>
  );
}
