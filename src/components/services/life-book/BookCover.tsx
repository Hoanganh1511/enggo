"use client";

import { motion } from "framer-motion";
import { PAGE_HEIGHT, PAGE_WIDTH } from "./book-dimensions";

// Bia sach (muc "neu co time" trong spec) - CHUA phai 1 to lat 3D that (chi
// fade+scale don gian khi mo), rieng biet voi co che lat leaf trong Book.tsx.
export function BookCover({
  title,
  onOpen,
}: {
  title: string;
  onOpen: () => void;
}) {
  return (
    <motion.button
      type="button"
      onClick={onOpen}
      whileHover={{ scale: 1.015 }}
      whileTap={{ scale: 0.985 }}
      className="flex cursor-pointer flex-col items-center justify-center gap-3 rounded-lg text-white shadow-2xl"
      style={{
        width: PAGE_WIDTH * 2,
        height: PAGE_HEIGHT,
        background: "linear-gradient(135deg, #7c3aed, #db2777)",
      }}
    >
      <span className="text-2xl font-extrabold">{title}</span>
      <span className="text-sm opacity-80">Click để mở sách</span>
    </motion.button>
  );
}
