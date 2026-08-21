"use client";

import { AnimatePresence, motion } from "framer-motion";
import type { ApiMessageReaction } from "@/lib/api/types";
import { cn } from "@/lib/utils";

// Hang pill cam xuc NGAY DUOI bubble (khong phai toolbar co dinh ben ngoai) -
// moi pill tu mount/unmount rieng (AnimatePresence + key=emoji) de co "small
// scale bounce" khi 1 loai cam xuc moi xuat hien/bien mat, thay vi ca hang
// nhay cung luc.
export function MessageReaction({
  reactions,
  align,
  onToggle,
}: {
  reactions: ApiMessageReaction[];
  align: "justify-end" | "justify-start";
  onToggle: (emoji: string, reactedByMe: boolean) => void;
}) {
  if (reactions.length === 0) return null;

  return (
    <div className={cn("mt-1 flex flex-wrap gap-1", align)}>
      <AnimatePresence initial={false}>
        {reactions.map((r) => (
          <motion.button
            key={r.emoji}
            type="button"
            layout
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            onClick={() => onToggle(r.emoji, r.reactedByMe)}
            className={cn(
              "flex cursor-pointer items-center gap-1 rounded-full border px-2 py-0.5 text-[12px] shadow-[0_1px_3px_rgba(15,23,42,.08)] transition-colors duration-150 ease-out",
              r.reactedByMe
                ? "border-primary bg-primary/10"
                : "border-slate-200 bg-white hover:bg-slate-50",
            )}
          >
            <span>{r.emoji}</span>
            <span className="text-slate-500">{r.count}</span>
          </motion.button>
        ))}
      </AnimatePresence>
    </div>
  );
}
