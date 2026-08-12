"use client";

import { motion, type Variants } from "framer-motion";
import {
  ArrowRight,
  ArrowUpRight,
  AtSign,
  Bell,
  Bookmark,
  BookOpen,
  Check,
  CircleHelp,
  Command,
  FileText,
  FolderKanban,
  Globe2,
  LifeBuoy,
  MessageCircle,
  Search,
  Settings2,
  Sparkles,
  UserRound,
  Wrench,
  type LucideIcon,
} from "lucide-react";
import MechanicalPanel from "./MechanicalPanel";

// 4 dropdown noi dung cua TopHeaderBar - bê nguyên UI/UX/animation tu source
// rieng "treecareer-topbar-command-center" (Panels.tsx), doi mau hardcode
// sang token CSS. Du lieu ben trong la PLACEHOLDER (giong tinh than "sắp ra
// mắt" cua nut cu) - khi co API that (thong bao/tin nhan/bookmark that) thay
// mang cung ("items") bang du lieu fetch, giu nguyen UI/animation.
const rowVariants: Variants = {
  hidden: { opacity: 0, x: -12 },
  show: (i: number) => ({
    opacity: 1,
    x: 0,
    transition: { type: "spring", stiffness: 320, damping: 22, delay: 0.05 + i * 0.045 },
  }),
};

type RowItem = { title: string; sub?: string; icon?: LucideIcon; right?: string };

function Rows({ items }: { items: RowItem[] }) {
  return (
    <div className="overflow-hidden rounded-xl" style={{ border: "1px solid var(--border)" }}>
      {items.map((x, i) => {
        const Icon = x.icon || FileText;
        return (
          <motion.button
            key={x.title}
            type="button"
            custom={i}
            variants={rowVariants}
            initial="hidden"
            animate="show"
            className="flex w-full items-center gap-3 px-3 py-3 text-left transition-colors duration-150 ease-out last:border-0 hover:bg-[color:var(--surface-muted)]"
            style={{ borderBottom: "1px solid var(--border-subtle)" }}
          >
            <span
              className="grid h-8 w-8 shrink-0 place-items-center rounded-lg"
              style={{
                border: "1px solid color-mix(in srgb, var(--primary) 18%, transparent)",
                background: "color-mix(in srgb, var(--primary) 7%, transparent)",
                color: "var(--primary)",
              }}
            >
              <Icon size={14} />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block truncate text-[10px] font-medium" style={{ color: "var(--ink)" }}>
                {x.title}
              </span>
              {x.sub && (
                <span className="mt-1 block truncate text-[8px]" style={{ color: "var(--ink-faint)" }}>
                  {x.sub}
                </span>
              )}
            </span>
            {x.right && (
              <span className="shrink-0 text-[8px]" style={{ color: "var(--ink-disabled)" }}>
                {x.right}
              </span>
            )}
            <ArrowUpRight size={12} style={{ color: "var(--ink-disabled)" }} />
          </motion.button>
        );
      })}
    </div>
  );
}

function Tabs({ names }: { names: string[] }) {
  return (
    <div className="flex gap-2">
      {names.map((name, i) => (
        <button
          key={name}
          type="button"
          className="rounded-lg px-3 py-2 text-[8px]"
          style={
            i === 0
              ? {
                  border: "1px solid color-mix(in srgb, var(--primary) 30%, transparent)",
                  background: "color-mix(in srgb, var(--primary) 8%, transparent)",
                  color: "var(--primary)",
                }
              : { border: "1px solid var(--border)", color: "var(--ink-faint)" }
          }
        >
          {name}
        </button>
      ))}
    </div>
  );
}

function SearchBox({ text }: { text: string }) {
  return (
    <div
      className="flex items-center gap-2 rounded-lg px-3 py-2 text-[9px]"
      style={{ border: "1px solid var(--border)", background: "var(--surface)", color: "var(--ink-faint)" }}
    >
      <Search size={13} />
      {text}
    </div>
  );
}

function FooterLink({ text }: { text: string }) {
  return (
    <button
      type="button"
      className="mt-3 flex w-full items-center justify-between px-1 text-[9px]"
      style={{ color: "var(--primary)" }}
    >
      {text}
      <ArrowRight size={13} />
    </button>
  );
}

export function SavedPanel() {
  return (
    <MechanicalPanel title="Đã lưu" eyebrow="LIBRARY" icon={<Bookmark size={17} />} width="w-[340px]">
      <div className="p-4">
        <Tabs names={["Tất cả", "Bài viết", "Workspace", "Tài nguyên"]} />
        <div className="mt-3">
          <Rows
            items={[
              { title: "Roadmap Frontend Developer 2024", sub: "Bài viết · Đã lưu hôm qua", icon: FileText },
              { title: "AWS Certified Solutions Architect", sub: "Workspace · Đã lưu 2 ngày trước", icon: FolderKanban },
              { title: "System Design: Scalability", sub: "Bài viết · Đã lưu 5 ngày trước", icon: FileText },
              { title: "Clean Code Principles", sub: "Tài nguyên · Đã lưu 1 tuần trước", icon: Globe2 },
            ]}
          />
        </div>
        <FooterLink text="Xem tất cả" />
      </div>
    </MechanicalPanel>
  );
}

export function MessagesPanel() {
  return (
    <MechanicalPanel
      title="Tin nhắn"
      eyebrow="COMMUNICATION"
      icon={<MessageCircle size={17} />}
      width="w-[320px]"
    >
      <div className="p-4">
        <SearchBox text="Tìm kiếm tin nhắn..." />
        <div className="mt-3">
          <Rows
            items={[
              { title: "AI Assistant", sub: "Gợi ý cho bạn: Frontend roadmap... · 10:30", icon: Sparkles },
              { title: "Design System Team", sub: "Phương: Minh đã cập nhật Figma... · 09:15", icon: MessageCircle },
              { title: "Minh Anh", sub: "Bạn: Ok, cảm ơn nhé! · Hôm qua", icon: UserRound },
              { title: "Product Hub", sub: "Release version 2.4.0 · 2 ngày trước", icon: Globe2 },
            ]}
          />
        </div>
        <FooterLink text="Xem tất cả tin nhắn" />
      </div>
    </MechanicalPanel>
  );
}

export function NotificationsPanel() {
  return (
    <MechanicalPanel
      title="Thông báo"
      eyebrow="NOTIFICATION CORE"
      icon={<Bell size={17} />}
      width="w-[360px]"
      action={
        <span className="flex items-center gap-1 text-[8px]" style={{ color: "var(--primary)" }}>
          <Check size={12} />
          Đánh dấu đã đọc
        </span>
      }
    >
      <div className="p-4">
        <Tabs names={["Tất cả", "@ Đề cập", "Hoạt động", "Hệ thống"]} />
        <div className="mt-3">
          <Rows
            items={[
              { title: "Minh Anh", sub: "đã bình luận bài viết của bạn · 5 phút trước", icon: MessageCircle },
              { title: "AI Assistant", sub: "đã gợi ý tài nguyên mới · 1 giờ trước", icon: Sparkles },
              { title: "Phương", sub: "đã đề cập bạn trong bài viết · 3 giờ trước", icon: AtSign },
              { title: "Hệ thống", sub: "Bảo trì hệ thống vào 02:00 AM · 1 ngày trước", icon: Settings2 },
            ]}
          />
        </div>
        <FooterLink text="Xem tất cả thông báo" />
      </div>
    </MechanicalPanel>
  );
}

export function HelpPanel() {
  return (
    <MechanicalPanel title="Trợ giúp" eyebrow="SYSTEM SUPPORT" icon={<CircleHelp size={17} />} width="w-[320px]">
      <div className="p-4">
        <SearchBox text="Tìm kiếm trợ giúp..." />
        <div className="mt-3">
          <Rows
            items={[
              { title: "Hướng dẫn bắt đầu", sub: "Làm quen với TreeCareer", icon: BookOpen },
              { title: "Trung tâm trợ giúp", sub: "Câu hỏi thường gặp và hướng dẫn", icon: LifeBuoy },
              { title: "Phím tắt", sub: "Các phím tắt trên TreeCareer", icon: Command },
              { title: "Liên hệ hỗ trợ", sub: "Gửi yêu cầu hỗ trợ đến đội ngũ", icon: Wrench },
            ]}
          />
        </div>
        <div
          className="mt-3 flex justify-between rounded-lg px-3 py-2 text-[8px]"
          style={{ border: "1px solid var(--border)" }}
        >
          <span style={{ color: "var(--ink-muted)" }}>Trạng thái hệ thống</span>
          <span style={{ color: "#34d399" }}>● Hoạt động</span>
        </div>
      </div>
    </MechanicalPanel>
  );
}
