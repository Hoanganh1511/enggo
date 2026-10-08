"use client";

import { useState } from "react";
import { Check, ChevronDown, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  DropdownMenuRoot,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";

// [2026-10-08] Primitive DUNG CHUNG cho moi modal "macOS style" trong Planner
// (EventForm.tsx, ReminderForm.tsx, ...) - tach ra tu EventForm (component
// dau tien dung bo primitive nay) khi ReminderForm can LAP LAI gan het cung
// 1 bo control (input/label/ghost-add-row/dropdown khong native/toggle
// switch/nut xoa-can-confirm). Theo docs/planner-macos-design-system.md -
// moi chinh sua token/hanh vi control o day se tu dong ap dung cho CA 2 (va
// moi form macOS-style sau nay).

export function pad2(n: number): string {
  return n.toString().padStart(2, "0");
}
export function todayISO(): string {
  const d = new Date();
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
}
export function roundedNowHM(): string {
  const d = new Date();
  const m = Math.ceil(d.getMinutes() / 15) * 15;
  const h = (d.getHours() + Math.floor(m / 60)) % 24;
  return `${pad2(h)}:${pad2(m % 60)}`;
}
export function isValidUrl(s: string): boolean {
  const v = s.trim();
  if (!v) return true;
  try {
    new URL(v.includes("://") ? v : `https://${v}`);
    return true;
  } catch {
    return false;
  }
}
export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
export function randomId(): string {
  return Math.random().toString(36).slice(2, 10);
}

// 1 input text dung CHUNG cho ca form - vien/mau/focus ring khop dung token
// `--mset-*` (xem docs/planner-macos-design-system.md, muc NumberField).
export function FormInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={cn(
        "h-9 w-full rounded-[8px] border border-[color:var(--planner-border-soft)] bg-white px-2.5 text-[13px] text-[color:var(--planner-text-primary)] outline-none transition-[border-color,box-shadow] duration-150 ease-out placeholder:text-[color:var(--planner-text-muted)] focus:border-[color:var(--planner-primary)] focus:shadow-[0_0_0_3px_rgba(0,122,255,.12)]",
        props.className,
      )}
    />
  );
}
export function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <span
      className="text-[11px] font-semibold tracking-[.02em] uppercase"
      style={{ color: "var(--mset-text-tertiary)" }}
    >
      {children}
    </span>
  );
}

// Pattern "ghost add row" (xem docs/planner-macos-design-system.md) - field
// KHONG bat buoc, an mac dinh, hien control that khi bam.
export function GhostAddButton({
  icon: Icon,
  label,
  onClick,
}: {
  icon: React.ComponentType<{ size?: number }>;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex h-9 w-fit cursor-pointer items-center gap-1.5 rounded-[8px] px-1 text-[13px] font-medium text-[color:var(--planner-text-muted)] hover:text-[color:var(--planner-text-secondary)]"
    >
      <Icon size={14} /> {label}
    </button>
  );
}

// Toggle switch macOS (section 14, docs/planner-macos-design-system.md) -
// dung cho MOI "Add X"/"Remind..." boolean trong EventForm/ReminderForm,
// thay `<input type=checkbox>` mac dinh.
export function ToggleSwitch({
  checked,
  onChange,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className="relative h-[22px] w-[38px] shrink-0 cursor-pointer rounded-full border-0 p-0 transition-colors duration-150 ease-out"
      style={{ background: checked ? "var(--mset-success)" : "#d1d1d6" }}
    >
      <span
        className="absolute top-0.5 left-0.5 size-[18px] rounded-full bg-white shadow-[0_1px_3px_rgba(0,0,0,.2)] transition-transform duration-150 ease-out"
        style={{ transform: checked ? "translateX(16px)" : "translateX(0)" }}
      />
    </button>
  );
}

// Dropdown KHONG native (quy uoc chung toan app). `container` forward xuong
// de an toan khi dung LONG trong 1 Radix Dialog (xem comment
// DropdownMenuContent, ui/dropdown-menu.tsx).
export function InlineSelect<T extends string>({
  value,
  options,
  onChange,
  container,
  renderDot,
  renderIcon,
}: {
  value: T;
  options: { value: T; label: string }[];
  onChange: (v: T) => void;
  container?: HTMLElement | null;
  renderDot?: (value: T) => string | undefined;
  renderIcon?: (value: T) => React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const current = options.find((o) => o.value === value);
  const dotColor = renderDot?.(value);
  return (
    <DropdownMenuRoot open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className="flex h-9 w-full cursor-pointer items-center justify-between gap-2 rounded-[8px] border border-[color:var(--planner-border-soft)] bg-white px-2.5 text-[13px] font-medium text-[color:var(--planner-text-primary)] outline-none hover:border-[color:var(--planner-border)]"
        >
          <span className="flex min-w-0 items-center gap-1.5">
            {renderIcon?.(value)}
            {dotColor && (
              <span
                className="size-2.5 shrink-0 rounded-full"
                style={{ backgroundColor: dotColor }}
                aria-hidden="true"
              />
            )}
            <span className="truncate">{current?.label ?? value}</span>
          </span>
          <ChevronDown size={13} className="shrink-0 text-[color:var(--planner-text-muted)]" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        open={open}
        align="start"
        container={container}
        className="z-50 max-h-64 w-[var(--radix-dropdown-menu-trigger-width)] min-w-[180px] overflow-y-auto rounded-[10px] border border-[color:var(--planner-border)] bg-white p-1 shadow-[0_10px_28px_rgba(20,30,50,.16)]"
        style={{ fontFamily: "var(--planner-font-family)" }}
      >
        {options.map((o) => {
          const dot = renderDot?.(o.value);
          return (
            <DropdownMenuItem
              key={o.value}
              onSelect={() => onChange(o.value)}
              className="flex cursor-pointer items-center justify-between gap-2 rounded-[7px] px-2.5 py-1.5 text-[12.5px] font-medium text-[color:var(--planner-text-secondary)] outline-none hover:bg-[var(--planner-surface-soft)]"
            >
              <span className="flex min-w-0 items-center gap-1.5">
                {renderIcon?.(o.value)}
                {dot && (
                  <span
                    className="size-2.5 shrink-0 rounded-full"
                    style={{ backgroundColor: dot }}
                    aria-hidden="true"
                  />
                )}
                <span className="truncate">{o.label}</span>
              </span>
              {value === o.value && (
                <Check size={13} className="shrink-0 text-[color:var(--planner-primary)]" />
              )}
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenuRoot>
  );
}

// Xoa - can confirm TRUOC khi goi onDelete (spec ca EventForm lan
// ReminderForm deu yeu cau: "hiện confirm dialog trước khi gọi onDelete").
export function DeleteConfirmPopover({
  label,
  onConfirm,
}: {
  label: string;
  onConfirm: () => void;
}) {
  const [open, setOpen] = useState(false);
  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label={label}
        title={label}
        className="flex size-8 cursor-pointer items-center justify-center rounded-[9px] text-[color:var(--planner-text-muted)] transition-colors duration-150 ease-out hover:bg-[rgba(255,59,48,.08)] hover:text-[color:var(--mset-danger)]"
      >
        <Trash2 size={15} />
      </button>
    );
  }
  return (
    <div className="flex items-center gap-1 rounded-[9px] border border-[color:var(--mset-danger)] bg-[rgba(255,59,48,.06)] px-1.5 py-1">
      <span className="px-1 text-[11.5px] font-medium" style={{ color: "var(--mset-danger)" }}>
        Delete?
      </span>
      <button
        type="button"
        onClick={onConfirm}
        className="cursor-pointer rounded-[6px] px-2 py-1 text-[11.5px] font-semibold text-white"
        style={{ backgroundColor: "var(--mset-danger)" }}
      >
        Yes
      </button>
      <button
        type="button"
        onClick={() => setOpen(false)}
        className="cursor-pointer rounded-[6px] px-2 py-1 text-[11.5px] font-medium text-[color:var(--planner-text-muted)] hover:text-[color:var(--planner-text-secondary)]"
      >
        No
      </button>
    </div>
  );
}
