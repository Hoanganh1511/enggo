"use client";

import { motion } from "framer-motion";
import { useFocusModeStore } from "@/stores/focus-mode-store";
import { cn } from "@/lib/utils";

// Boc hang flex aside+content chinh cua trang Series ((read)/layout.tsx,
// Server Component - khong doc duoc Zustand).
//
// [2026-09-15] Doi hoan toan hanh vi khi Focus mode bat - yeu cau nguoi
// dung: "Kết hợp Cinema Mode vào Focus mode... phần nội dung chính gồm
// sidebar seri và chi tiết bài -> cả cụm này sẽ có animation di chuyển ra
// chính giữa màn hình, phần top của nó thì di chuyển lên sát bám vào top
// viewport". Truoc day Focus mode chi tinh lai minHeight (header tu an di
// cho ho); gio CA CUM NAY chuyen sang `position: fixed`, can giua ngang
// (inset-x-0 + max-width + margin-x-auto - ky thuat can giua chuan cho phan
// tu fixed/absolute co gioi han chieu rong), dinh sat dinh viewport (top-0),
// z-40 (tren ca backdrop toi z-30 cua SeriesFocusBackdrop.tsx). `layout`
// prop cua framer-motion tu "bay" no tu vi tri/kich thuoc BINH THUONG (trong
// luong trang) sang vi tri fixed/can giua MOI bang 1 animation FLIP muot,
// dung tinh than "animation di chuyển" nguoi dung mo ta - khong phai bat/tat
// tuc thi.
export function SeriesFocusRow({ children }: { children: React.ReactNode }) {
  const focusModeActive = useFocusModeStore((s) => s.active);
  return (
    <motion.div
      layout
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className={cn(
        "flex bg-background",
        focusModeActive
          ? // Fixed + can giua + dinh top - "ra chính giữa màn hình...
            // sát bám vào top viewport". max-w gioi han (khong full-bleed)
            // de van con thay duoc backdrop toi 2 ben nhu "letterbox" rap
            // phim. overflow-y-auto rieng vi gio o NGOAI luong trang, khong
            // con thua huong scroll cua window nhu truoc.
            "fixed inset-x-0 top-0 z-40 mx-auto max-w-360 overflow-y-auto shadow-2xl"
          : "-mx-4 -my-6 sm:-mx-6 lg:-mx-10",
      )}
      style={{
        minHeight: focusModeActive ? undefined : "calc(100vh - var(--header-height))",
        height: focusModeActive ? "100vh" : undefined,
      }}
    >
      {children}
    </motion.div>
  );
}
