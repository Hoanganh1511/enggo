"use client";

import { motion } from "framer-motion";
import { FileText } from "lucide-react";
import { sidebarStagger, sidebarFadeUp, SidebarSectionLabel } from "./article-tab-shared";

// Tai lieu nghien cuu dinh kem cho bai viet - Document CHUA co truong nao
// luu du lieu nay (khong co model "attachment"/"resource" gan voi 1 bai
// viet trong schema that) - gan nhan "· DEMO" ro rang, khong gia vo la
// tinh nang that (cung tinh than voi cac panel demo khac trong khu vuc
// nay - xem docs/workspace-style-guide.md muc 7).
const DEMO_RESOURCES = [
  "AWS Official Documentation",
  "Kiến trúc tham khảo.png",
  "Ghi chú buổi build.pdf",
];

export function ArticleResources() {
  return (
    <div className="p-4">
      <SidebarSectionLabel>TÀI LIỆU NGHIÊN CỨU · DEMO</SidebarSectionLabel>
      <p className="mb-3 text-[10px]" style={{ color: "var(--ink-faint)" }}>
        Chưa có tính năng đính kèm tài liệu thật cho bài viết.
      </p>
      {/* Rieng tab nay KHONG them hover-lift/border-illumination/nut tai
          xuong nhu ban goc - cac hang o day khong co onClick that (khong co
          model dinh kem/tai xuong that trong schema), them hieu ung tuong
          tac se ngu y day la tinh nang dung duoc trong khi khong phai (trai
          nguyen tac "khong gia vo tinh nang that" da chot cho khu vuc nay).
          Van giu stagger luc mount vi do thuan la hieu ung xuat hien, khong
          ngu y clickable. */}
      <motion.div
        variants={sidebarStagger}
        initial="hidden"
        animate="show"
        className="space-y-2"
      >
        {DEMO_RESOURCES.map((x) => (
          <motion.div
            key={x}
            variants={sidebarFadeUp}
            className="flex items-center gap-3 rounded-[11px] p-3 opacity-60"
            style={{ border: "1px solid var(--border)" }}
          >
            <span
              className="grid size-8 place-items-center rounded-[9px]"
              style={{
                background: "var(--active-bg)",
                color: "var(--primary)",
              }}
            >
              <FileText size={14} strokeWidth={1.9} />
            </span>
            <span className="text-[11px]" style={{ color: "var(--ink-muted)" }}>
              {x}
            </span>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
}
