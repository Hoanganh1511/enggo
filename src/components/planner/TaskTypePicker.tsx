"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Plus, CalendarDays, Bell, Repeat, Users, X } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  DropdownMenuRoot,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { useIsMobile } from "./use-is-mobile";

// [2026-10-08] TaskTypePicker - "Code component TaskTypePicker — button mở
// popover chọn loại task". DOC LAP, controlled qua `onSelect` (component tu
// quan ly state mo/dong popover NOI BO - khong co open/onOpenChange trong
// props nguoi dung dua). Style theo docs/planner-macos-design-system.md.
//
// [2026-10-08] "position" (bottom-start|bottom-end|top-start) chi co y
// nghia tren DESKTOP (anh xa sang side/align cua Radix DropdownMenu) - tren
// MOBILE, spec rieng doi hoi "popover full-width, bottom sheet style" (1
// layout HOAN TOAN khac, dinh o DAY MAN HINH, khong con la 1 popover neo
// theo trigger nua) nen `position` bi BO QUA o breakpoint do, dung spec.

export type TaskType = "event" | "reminder" | "recurring" | "shared";
export type TaskTypePickerPosition = "bottom-start" | "bottom-end" | "top-start";

const TASK_TYPE_ITEMS: {
  type: TaskType;
  icon: typeof CalendarDays;
  title: string;
  description: string;
}[] = [
  { type: "event", icon: CalendarDays, title: "Event", description: "Schedule meetings, appointments" },
  { type: "reminder", icon: Bell, title: "Reminder", description: "Tasks with due dates, priorities" },
  { type: "recurring", icon: Repeat, title: "Recurring", description: "Repeating events or reminders" },
  { type: "shared", icon: Users, title: "Shared Calendar", description: "Share with others via iCloud" },
];

// Phan NOI DUNG thuan tuy (icon + title + description) - DUNG CHUNG cho ca
// 2 duong render (desktop: con cua Radix DropdownMenu.Item; mobile: con cua
// 1 <button> thuong trong bottom sheet). KHONG tu la 1 phan tu tuong tac -
// cha (DropdownMenuItem hoac <button>) moi la noi nhan role/focus/click,
// tranh long 2 lop tuong tac (vi pham accessibility: button trong
// menuitem).
function TaskTypeItemContent({
  icon: Icon,
  title,
  description,
}: {
  icon: typeof CalendarDays;
  title: string;
  description: string;
}) {
  return (
    <>
      <span
        className="flex size-9 shrink-0 items-center justify-center rounded-[9px]"
        style={{ background: "var(--mset-surface-tertiary)", color: "var(--planner-primary)" }}
        aria-hidden="true"
      >
        <Icon size={17} strokeWidth={1.8} />
      </span>
      <span className="flex min-w-0 flex-col gap-0.5">
        <span className="text-[13.5px] font-semibold text-[color:var(--planner-text-primary)]">{title}</span>
        <span className="truncate text-[12px] text-[color:var(--planner-text-muted)]">{description}</span>
      </span>
    </>
  );
}

export function TaskTypePicker({
  onSelect,
  position = "bottom-start",
  variant = "icon",
}: {
  onSelect: (type: TaskType) => void;
  position?: TaskTypePickerPosition;
  // "Icon '+' trong vòng tròn, hoặc 'New Task'" - spec de ngo CA 2, phoi cho
  // noi goi chon qua prop nay thay vi tu quyet dinh 1 trong 2.
  variant?: "icon" | "label";
}) {
  const [open, setOpen] = useState(false);
  const isMobile = useIsMobile();

  function handlePick(type: TaskType) {
    onSelect(type);
    setOpen(false);
  }

  const [side, align] = position === "bottom-end"
    ? (["bottom", "end"] as const)
    : position === "top-start"
      ? (["top", "start"] as const)
      : (["bottom", "start"] as const);

  const trigger =
    variant === "icon" ? (
      <button
        type="button"
        aria-label="New task"
        aria-haspopup="menu"
        aria-expanded={open}
        className="flex size-8 cursor-pointer items-center justify-center rounded-full transition-colors duration-150 ease-out"
        style={{
          background: open ? "var(--planner-primary)" : "var(--planner-surface-soft)",
          color: open ? "#fff" : "var(--planner-text-secondary)",
        }}
      >
        <Plus size={16} strokeWidth={2.4} />
      </button>
    ) : (
      <button
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        className="flex h-8 cursor-pointer items-center gap-1.5 rounded-[9px] border px-3 text-[13px] font-semibold transition-colors duration-150 ease-out"
        style={{
          borderColor: open ? "var(--planner-primary)" : "var(--planner-border)",
          background: open ? "var(--planner-primary-soft)" : "white",
          color: open ? "var(--planner-primary)" : "var(--planner-text-secondary)",
        }}
      >
        <Plus size={14} strokeWidth={2.4} />
        New Task
      </button>
    );

  // [2026-10-08] Mobile - bottom sheet RIENG (khong con la Radix
  // DropdownMenu neo theo trigger - spec doi hoi 1 layout khac han: dinh
  // day man hinh, full-width). Tu quan ly backdrop-click/Escape (Radix
  // DropdownMenu lo san 2 thu nay cho nhanh desktop, nhanh mobile phai tu
  // viet lai vi khong con dung component do nua).
  if (isMobile) {
    return (
      <>
        <span onClick={() => setOpen((v) => !v)}>{trigger}</span>
        <AnimatePresence>
          {open && (
            <>
              <motion.div
                className="fixed inset-0 z-50 bg-black/30"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15, ease: "easeOut" }}
                onClick={() => setOpen(false)}
              />
              <motion.div
                role="menu"
                aria-label="New task type"
                className="fixed inset-x-0 bottom-0 z-50 rounded-t-[18px] pb-[max(12px,env(safe-area-inset-bottom))]"
                style={{
                  background: "rgba(255,255,255,.98)",
                  boxShadow: "0 -8px 32px rgba(0,0,0,.16)",
                  fontFamily: "var(--planner-font-family)",
                }}
                initial={{ y: "100%" }}
                animate={{ y: 0 }}
                exit={{ y: "100%" }}
                transition={{ duration: 0.22, ease: "easeOut" }}
                onKeyDown={(e) => {
                  if (e.key === "Escape") setOpen(false);
                }}
              >
                <div className="flex items-center justify-between px-4 pt-3 pb-1">
                  <span className="mx-auto h-1 w-9 rounded-full" style={{ background: "var(--mset-border-strong)" }} />
                  <button
                    type="button"
                    onClick={() => setOpen(false)}
                    aria-label="Close"
                    className="absolute top-2.5 right-2.5 flex size-7 cursor-pointer items-center justify-center rounded-full text-[color:var(--planner-text-muted)] hover:bg-[var(--planner-surface-soft)]"
                  >
                    <X size={15} />
                  </button>
                </div>
                <div className="flex flex-col gap-0.5 px-2 pt-1 pb-3">
                  {TASK_TYPE_ITEMS.map((item) => (
                    <button
                      key={item.type}
                      type="button"
                      role="menuitem"
                      onClick={() => handlePick(item.type)}
                      className="flex w-full cursor-pointer items-start gap-3 rounded-[10px] px-2.5 py-2.5 text-left transition-colors duration-150 ease-out hover:bg-[var(--planner-surface-soft)] active:bg-[var(--planner-surface-soft)]"
                    >
                      <TaskTypeItemContent icon={item.icon} title={item.title} description={item.description} />
                    </button>
                  ))}
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </>
    );
  }

  // Desktop - Radix DropdownMenu (roving focus co san: Arrow keys/Enter/
  // Escape/click-outside deu da duoc Radix xu ly dung spec "Behaviors" mien
  // phi, khong can tu viet lai). Animation scale+fade DA la preset chung
  // toan app (xem DropdownMenuContent, CLAUDE.md "UI conventions") - tai
  // dung THANG, khong tu che rieng cho component nay.
  return (
    <DropdownMenuRoot open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>{trigger}</DropdownMenuTrigger>
      <DropdownMenuContent
        open={open}
        side={side}
        align={align}
        sideOffset={8}
        className={cn(
          "z-50 w-[280px] rounded-[12px] border border-[color:var(--planner-border)] bg-white p-1.5 shadow-[0_10px_28px_rgba(20,30,50,.16)]",
        )}
        style={{ fontFamily: "var(--planner-font-family)" }}
      >
        {TASK_TYPE_ITEMS.map((item) => (
          <DropdownMenuItem
            key={item.type}
            onSelect={() => handlePick(item.type)}
            className="flex cursor-pointer items-start gap-3 rounded-[9px] px-2.5 py-2 outline-none transition-colors duration-150 ease-out hover:bg-[var(--planner-surface-soft)] data-[highlighted]:bg-[var(--planner-surface-soft)]"
          >
            <TaskTypeItemContent icon={item.icon} title={item.title} description={item.description} />
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenuRoot>
  );
}
