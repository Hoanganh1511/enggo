"use client";
import { useEffect } from "react";
import type { AppNode } from "@/lib/whiteboard/types";
import { motion } from "framer-motion";

type BoardDetailModalProps = {
  node: AppNode;
  onClose: () => void;
};
const BoardDetailModal = ({ node, onClose }: BoardDetailModalProps) => {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [onClose]);

  const typeLabel = node.type === "parentBoard" ? "Bảng cha" : "Bảng con";
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl dark:bg-zinc-900"
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-zinc-400">
              {typeLabel}
            </p>
            <h2 className="mt-1 text-lg font-semibold text-foreground">
              {node.data.title}
            </h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-zinc-500 transition-colors hover:bg-zinc-100 dark:hover:bg-zinc-800"
            aria-label="Đóng"
          >
            ✕
          </button>
        </div>
        <p className="mt-4 text-sm text-zinc-600 dark:text-zinc-400">
          {node.data.description ?? "Chưa có mô tả cho bảng này."}
        </p>
        <dl className="mt-4 grid grid-cols-2 gap-2 border-t border-zinc-100 pt-4 text-xs text-zinc-500 dark:border-zinc-800">
          <div>
            <dt className="font-medium text-zinc-400">ID</dt>
            <dd className="mt-0.5">{node.id}</dd>
          </div>
          <div>
            <dt className="font-medium text-zinc-400">Vị trí</dt>
            <dd className="mt-0.5">
              x: {Math.round(node.position.x)}, y: {Math.round(node.position.y)}
            </dd>
          </div>
        </dl>
      </motion.div>
    </motion.div>
  );
};

export default BoardDetailModal;
