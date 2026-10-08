"use client";

import { useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import {
  Check,
  X,
  SlidersHorizontal,
  CalendarDays,
  LayoutList,
  Palette,
} from "lucide-react";
import { TimePickerField } from "./time-picker-field";
import { usePlannerSettings } from "./planner-settings-context";
import { useTypeColorOverrides } from "./life-item-palette-context";
import type { PlannerSettings } from "@/lib/api/planner";
import {
  LIFE_ITEM_TYPES,
  LIFE_ITEM_PALETTES,
  resolveLifeItemPalette,
  type LifeItemType,
} from "@/lib/planner/life-item-types";

// [2026-10-08] Settings modal cua Planner - REBUILD HOAN TOAN theo "style
// system hoan chinh" (36 muc design tokens: color/typography/modal/sidebar/
// section/button/segmented/toggle/checkbox/input/dropdown/shadow/spacing/
// radius/motion) nguoi dung dua, lay cam hung macOS System Settings ("quiet
// luxury", "native first", "neutral dominates 85-90%", "accent chi dung cho
// action/selection/focus"). Token rieng --mset-* dat o :root (globals.css,
// CUNG LY DO voi --planner-* - xem comment o do: modal nay dung
// Dialog.Portal, teleport ra document.body, NGOAI pham vi bat ky class
// "scope" nao, :root la noi DUY NHAT moi noi deu ke thua chac chan duoc).
//
// KHONG con dung SimpleModal (khung modal CHUNG toan app) nua - spec yeu cau
// chrome HOAN TOAN rieng (glass blur, radius 18px, shadow 2-lop, backdrop
// rieng) khac han SimpleModal, nen dung thang Radix Dialog o day.
//
// Dieu huong: TRUOC la 3 "trang" tuyen tinh (main -> colors -> palette) cho
// 1 popover CHAT HEP (w-72/23rem) - gio modal RONG 1080px, chuyen sang dung
// SIDEBAR nav (giong macOS System Settings that: 1 danh sach muc ben trai,
// noi dung tuong ung ben phai, KHONG can "← Back" nua) voi 4 muc: General/
// Calendar/Task appearance/Colors - "Colors" gop LUON ca "Task type colors"
// (tom tat) VA "Customize palette" (luoi mau tuong tac) vao 1 trang DUY
// NHAT (khong con 2 cap nhu truoc) vi khong gian da du rong.
//
// KHONG co nut Save/Cancel - MOI thay doi ap dung NGAY (usePlannerSettings().
// update(), da tu optimistic-update + goi API ngam), dung quy uoc "instant
// apply" da co san trong Planner.
const NAV_ITEMS = [
  { key: "general", label: "General", icon: SlidersHorizontal },
  { key: "calendar", label: "Calendar", icon: CalendarDays },
  { key: "appearance", label: "Task appearance", icon: LayoutList },
  { key: "colors", label: "Colors", icon: Palette },
] as const;
type NavKey = (typeof NAV_ITEMS)[number]["key"];

export function PlannerSettingsModal({
  open,
  onOpenChange,
  onChangeTypeColor,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onChangeTypeColor: (type: LifeItemType, paletteId: string) => void;
}) {
  const [nav, setNav] = useState<NavKey>("general");
  const { settings, update } = usePlannerSettings();
  const overrides = useTypeColorOverrides();
  // [2026-10-08] DOM node cua chinh Dialog.Content - truyen xuong lam
  // `container` cho Popover LONG BEN TRONG (TimePickerField o CalendarSection)
  // de Popover mount LAM CON cua dialog nay thay vi document.body - xem
  // comment chi tiet o PopoverContent (ui/popover.tsx): Dialog modal dung
  // FocusScope "trapped" giut focus ve lai dialog bat ky luc nao mot phan tu
  // NGOAI subtree cua no duoc focus, Portal mac dinh (document.body) nam
  // NGOAI subtree do nen nut/input trong Popover khong con bam/go duoc nua
  // (bug nguoi dung bao: "Không tương tác được trong chỗ chọn thời gian ở
  // setting"). State (khong phai ref thuan) vi can TRIGGER RE-RENDER 1 lan
  // khi node gan xong (ref callback), de cac con nhan dung gia tri KHONG
  // con null nua.
  const [contentEl, setContentEl] = useState<HTMLDivElement | null>(null);

  function handleOpenChange(next: boolean) {
    onOpenChange(next);
    if (!next) setNav("general");
  }

  return (
    <Dialog.Root open={open} onOpenChange={handleOpenChange}>
      <Dialog.Portal>
        {/* 04. BACKDROP - rgba(0,0,0,.18) + blur(8px), KHONG dung .5 (qua nang). */}
        <Dialog.Overlay
          className="fixed inset-0 z-50"
          style={{
            backgroundColor: "rgba(0,0,0,.18)",
            backdropFilter: "blur(8px)",
            WebkitBackdropFilter: "blur(8px)",
          }}
        />
        {/* 03. MODAL container - glass, radius 18px, shadow 2-lop. */}
        <Dialog.Content
          ref={setContentEl}
          onOpenAutoFocus={(e) => e.preventDefault()}
          className="fixed top-1/2 left-1/2 z-50 flex -translate-x-1/2 -translate-y-1/2 flex-col overflow-hidden focus:outline-none"
          style={{
            width: "min(1080px, calc(100vw - 48px))",
            height: "min(760px, calc(100vh - 48px))",
            background: "rgba(255,255,255,.92)",
            border: "1px solid rgba(255,255,255,.8)",
            borderRadius: 18,
            boxShadow: "0 32px 80px rgba(0,0,0,.14), 0 8px 24px rgba(0,0,0,.08)",
            backdropFilter: "blur(24px)",
            WebkitBackdropFilter: "blur(24px)",
            fontFamily: "var(--planner-font-family)",
          }}
        >
          <Dialog.Title className="sr-only">Cài đặt Planner</Dialog.Title>
          {/* 22. ICON BUTTON - close, goc tren-phai CUA CA modal (ngoai grid
              sidebar/content de luon o DUNG 1 vi tri du dang xem muc nao). */}
          <Dialog.Close asChild>
            <button
              type="button"
              aria-label="Đóng"
              className="absolute top-3 right-3 z-10 flex size-8 cursor-pointer items-center justify-center rounded-full text-[color:var(--mset-text-tertiary)] transition-[background-color,color,transform] duration-150 ease-out hover:bg-black/[.06] hover:text-[color:var(--mset-text-primary)] active:scale-[.94] focus-visible:outline-none focus-visible:shadow-[0_0_0_3px_rgba(0,122,255,.2)]"
            >
              <X size={16} strokeWidth={1.8} />
            </button>
          </Dialog.Close>

          {/* 05. LAYOUT - grid 260px + 1fr, height 100%. */}
          <div className="grid h-full min-h-0" style={{ gridTemplateColumns: "260px minmax(0,1fr)" }}>
            {/* Sidebar */}
            <nav
              className="flex flex-col gap-0.5 overflow-y-auto"
              style={{
                padding: "28px 16px",
                background: "rgba(247,247,249,.82)",
                borderRight: "1px solid rgba(0,0,0,.06)",
              }}
            >
              {NAV_ITEMS.map((item) => {
                const active = nav === item.key;
                const Icon = item.icon;
                return (
                  <button
                    key={item.key}
                    type="button"
                    data-active={active}
                    onClick={() => setNav(item.key)}
                    className="flex h-[46px] cursor-pointer items-center gap-3 rounded-[10px] border border-transparent px-3 text-left text-sm font-medium transition-[background-color,color] duration-150 ease-out"
                    style={{
                      background: active ? "rgba(0,122,255,.09)" : "transparent",
                      color: active ? "var(--mset-accent)" : "var(--mset-text-secondary)",
                      fontWeight: active ? 600 : 500,
                    }}
                    onMouseEnter={(e) => {
                      if (!active) e.currentTarget.style.background = "rgba(0,0,0,.045)";
                    }}
                    onMouseLeave={(e) => {
                      if (!active) e.currentTarget.style.background = "transparent";
                    }}
                  >
                    {/* 07. ICON CONTAINER */}
                    <span
                      className="grid size-[30px] shrink-0 place-items-center rounded-[8px]"
                      style={{
                        background: active ? "#eaf3ff" : "#f0f0f3",
                        color: active ? "var(--mset-accent)" : "var(--mset-text-secondary)",
                      }}
                    >
                      <Icon size={16} strokeWidth={1.7} />
                    </span>
                    {item.label}
                  </button>
                );
              })}
            </nav>

            {/* Content */}
            <div className="mset-scroll min-h-0 overflow-y-auto" style={{ padding: "32px 40px" }}>
              {nav === "general" && <GeneralSection settings={settings} update={update} />}
              {nav === "calendar" && (
                <CalendarSection settings={settings} update={update} portalContainer={contentEl} />
              )}
              {nav === "appearance" && <AppearanceSection settings={settings} update={update} />}
              {nav === "colors" && (
                <ColorsSection overrides={overrides} onChangeTypeColor={onChangeTypeColor} />
              )}
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

// 09. SECTION HEADER - "GENERAL" khong phai "General View", viet HOA +
// letter-spacing, tao cam giac macOS.
function Section({
  title,
  children,
  last,
}: {
  title: string;
  children: React.ReactNode;
  last?: boolean;
}) {
  return (
    <div
      className="flex flex-col"
      style={{
        padding: "24px 0",
        borderBottom: last ? "none" : "1px solid var(--mset-divider)",
      }}
    >
      <p
        className="mb-4 text-[13px] font-semibold uppercase"
        style={{ color: "var(--mset-text-secondary)", letterSpacing: ".04em" }}
      >
        {title}
      </p>
      <div className="flex flex-col">{children}</div>
    </div>
  );
}

// 10. SETTING ROW
function Row({
  label,
  description,
  children,
}: {
  label: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-[52px] items-center justify-between gap-6 py-2.5">
      <div className="min-w-0">
        <p className="text-sm font-medium" style={{ color: "var(--mset-text-primary)" }}>
          {label}
        </p>
        {description && (
          <p className="mt-0.5 text-xs leading-[17px]" style={{ color: "var(--mset-text-tertiary)" }}>
            {description}
          </p>
        )}
      </div>
      <div className="shrink-0">{children}</div>
    </div>
  );
}

// 13. SEGMENTED CONTROL
function SegmentedControl<T extends string | number>({
  value,
  options,
  onChange,
}: {
  value: T;
  options: { value: T; label: string }[];
  onChange: (v: T) => void;
}) {
  return (
    <div
      className="inline-flex"
      style={{
        padding: 2,
        background: "var(--mset-surface-tertiary)",
        border: "1px solid rgba(0,0,0,.06)",
        borderRadius: 9,
        boxShadow: "inset 0 1px 1px rgba(0,0,0,.03)",
      }}
    >
      {options.map((o) => {
        const active = value === o.value;
        return (
          <button
            key={String(o.value)}
            type="button"
            onClick={() => onChange(o.value)}
            className="h-7 cursor-pointer rounded-[7px] border-0 px-3 text-xs font-medium whitespace-nowrap outline-none transition-[background-color,color,box-shadow] duration-150 ease-out"
            style={{
              background: active ? "#ffffff" : "transparent",
              color: active ? "var(--mset-text-primary)" : "var(--mset-text-secondary)",
              boxShadow: active ? "0 1px 3px rgba(0,0,0,.10), 0 0 0 0.5px rgba(0,0,0,.04)" : "none",
            }}
          >
            {o.label}
          </button>
        );
      })}
    </div>
  );
}

// 14. TOGGLE - switch macOS, dung cho setting BOOLEAN DOC LAP (vd "Show
// weekends") - khac CHECKBOX (muc 15, dung cho 1 NHOM nhieu lua chon "Show").
function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className="relative h-[22px] w-[38px] shrink-0 cursor-pointer rounded-full border-0 p-0 transition-[background-color] duration-[180ms] ease-out focus-visible:outline-none focus-visible:shadow-[0_0_0_3px_rgba(0,122,255,.22)]"
      style={{ background: checked ? "var(--mset-success)" : "#d1d1d6" }}
    >
      <span
        className="absolute top-0.5 left-0.5 size-[18px] rounded-full bg-white transition-transform duration-[180ms]"
        style={{
          boxShadow: "0 1px 3px rgba(0,0,0,.20)",
          transform: checked ? "translateX(16px)" : "translateX(0)",
          transitionTimingFunction: "cubic-bezier(.2,.8,.2,1)",
        }}
      />
    </button>
  );
}

// 15. CHECKBOX - dung cho 1 NHOM nhieu lua chon doc lap (Task appearance
// "Show": Task type/Duration/Area/Project/Priority).
function Checkbox({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <label className="flex cursor-pointer items-center gap-2.5 py-1.5">
      <span
        role="checkbox"
        aria-checked={checked}
        tabIndex={0}
        onClick={() => onChange(!checked)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            onChange(!checked);
          }
        }}
        className="grid size-[18px] shrink-0 cursor-pointer place-items-center rounded-[5px] border transition-[background-color,border-color,transform] duration-150 ease-out active:scale-[.94]"
        style={{
          borderColor: checked ? "var(--mset-accent)" : "#c7c7cc",
          background: checked ? "var(--mset-accent)" : "#ffffff",
          boxShadow: checked ? "none" : "inset 0 1px 1px rgba(0,0,0,.04)",
        }}
      >
        {checked && <Check size={12} strokeWidth={3} className="text-white" />}
      </span>
      <span className="text-sm font-medium" style={{ color: "var(--mset-text-primary)" }}>
        {label}
      </span>
    </label>
  );
}

// 20. NUMBER INPUT
function NumberField({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  return (
    <input
      type="number"
      min={0}
      max={23}
      value={value}
      onChange={(e) => onChange(Math.min(23, Math.max(0, Number(e.target.value) || 0)))}
      className="h-9 w-16 text-center text-[13px] outline-none"
      style={{
        border: "1px solid #d2d2d7",
        borderRadius: 8,
        background: "#ffffff",
        color: "var(--mset-text-primary)",
      }}
      onFocus={(e) => {
        e.currentTarget.style.borderColor = "var(--mset-accent)";
        e.currentTarget.style.boxShadow = "0 0 0 3px rgba(0,122,255,.12)";
      }}
      onBlur={(e) => {
        e.currentTarget.style.borderColor = "#d2d2d7";
        e.currentTarget.style.boxShadow = "none";
      }}
    />
  );
}

function GeneralSection({
  settings,
  update,
}: {
  settings: PlannerSettings;
  update: (patch: Partial<Omit<PlannerSettings, "userId">>) => void;
}) {
  return (
    <Section title="General" last>
      <Row label="Week starts on">
        <SegmentedControl
          value={settings.weekStartsOn}
          options={[
            { value: "MONDAY", label: "Monday" },
            { value: "SUNDAY", label: "Sunday" },
          ]}
          onChange={(v) => update({ weekStartsOn: v })}
        />
      </Row>
      <Row label="Time format">
        <SegmentedControl
          value={settings.timeFormat}
          options={[
            { value: "24H", label: "24-hour" },
            { value: "12H", label: "12-hour" },
          ]}
          onChange={(v) => update({ timeFormat: v })}
        />
      </Row>
      <Row label="Show weekends">
        <Toggle checked={settings.showWeekends} onChange={(v) => update({ showWeekends: v })} />
      </Row>
      <Row label="Show all-day section">
        <Toggle
          checked={settings.showAllDaySection}
          onChange={(v) => update({ showAllDaySection: v })}
        />
      </Row>
      <Row label="Density" description="Compact thu nhỏ chiều cao mỗi hàng giờ trên lịch">
        <SegmentedControl
          value={settings.density}
          options={[
            { value: "COMFORTABLE", label: "Comfortable" },
            { value: "COMPACT", label: "Compact" },
          ]}
          onChange={(v) => update({ density: v })}
        />
      </Row>
    </Section>
  );
}

function CalendarSection({
  settings,
  update,
  portalContainer,
}: {
  settings: PlannerSettings;
  update: (patch: Partial<Omit<PlannerSettings, "userId">>) => void;
  portalContainer: HTMLDivElement | null;
}) {
  return (
    <Section title="Calendar" last>
      <Row label="Working hours" description="Khung giờ được tô đậm hơn trên lịch">
        <TimePickerField
          startMinute={settings.workingHoursStart}
          durationMinutes={Math.max(settings.workingHoursEnd - settings.workingHoursStart, 15)}
          onChange={(s, d) => update({ workingHoursStart: s ?? 0, workingHoursEnd: (s ?? 0) + d })}
          portalContainer={portalContainer}
        />
      </Row>
      <Row label="First visible hour">
        <NumberField
          value={settings.firstVisibleHour}
          onChange={(v) => update({ firstVisibleHour: Math.min(v, settings.lastVisibleHour - 1) })}
        />
      </Row>
      <Row label="Last visible hour">
        <NumberField
          value={settings.lastVisibleHour === 24 ? 23 : settings.lastVisibleHour}
          onChange={(v) => update({ lastVisibleHour: Math.max(v + 1, settings.firstVisibleHour + 1) })}
        />
      </Row>
      <Row label="Time slot" description="Nấc snap khi kéo-thả tạo/đổi giờ task">
        <SegmentedControl
          value={settings.timeSlotMinutes}
          options={[
            { value: 15, label: "15 min" },
            { value: 30, label: "30 min" },
            { value: 60, label: "60 min" },
          ]}
          onChange={(v) => update({ timeSlotMinutes: v })}
        />
      </Row>
    </Section>
  );
}

function AppearanceSection({
  settings,
  update,
}: {
  settings: PlannerSettings;
  update: (patch: Partial<Omit<PlannerSettings, "userId">>) => void;
}) {
  return (
    <>
      <Section title="Show on task card">
        <Checkbox label="Task type" checked={settings.showTaskType} onChange={(v) => update({ showTaskType: v })} />
        <Checkbox label="Duration" checked={settings.showDuration} onChange={(v) => update({ showDuration: v })} />
        <Checkbox label="Area" checked={settings.showArea} onChange={(v) => update({ showArea: v })} />
        <Checkbox label="Project" checked={settings.showProject} onChange={(v) => update({ showProject: v })} />
        <Checkbox label="Priority" checked={settings.showPriority} onChange={(v) => update({ showPriority: v })} />
      </Section>
      <Section title="Completed tasks" last>
        <Row label="Display">
          <SegmentedControl
            value={settings.completedTaskDisplay}
            options={[
              { value: "KEEP_VISIBLE", label: "Keep visible" },
              { value: "COLLAPSE", label: "Collapse" },
              { value: "HIDE", label: "Hide" },
            ]}
            onChange={(v) => update({ completedTaskDisplay: v })}
          />
        </Row>
        <Row label="Style">
          <SegmentedControl
            value={settings.completedTaskStyle}
            options={[
              { value: "CHECK_ICON", label: "Check icon" },
              { value: "CHECK_COLOR", label: "Check + color" },
              { value: "DONE_BADGE", label: "Done badge" },
              { value: "PATTERN", label: "Pattern" },
            ]}
            onChange={(v) => update({ completedTaskStyle: v })}
          />
        </Row>
      </Section>
    </>
  );
}

function ColorsSection({
  overrides,
  onChangeTypeColor,
}: {
  overrides: Partial<Record<LifeItemType, string>>;
  onChangeTypeColor: (type: LifeItemType, paletteId: string) => void;
}) {
  return (
    <Section title="Task type colors" last>
      <div className="flex flex-col gap-5">
        {LIFE_ITEM_TYPES.map((t) => {
          const current = resolveLifeItemPalette(t.id, overrides);
          return (
            <div key={t.id} className="flex flex-col gap-2">
              <span className="flex items-center gap-1.5 text-sm font-medium" style={{ color: "var(--mset-text-primary)" }}>
                <span aria-hidden="true">{t.icon}</span> {t.label}
                <span className="text-xs font-normal" style={{ color: "var(--mset-text-tertiary)" }}>
                  · {current.name}
                </span>
              </span>
              <div className="flex flex-wrap gap-2">
                {LIFE_ITEM_PALETTES.map((p) => {
                  const selected = current.id === p.id;
                  return (
                    <button
                      key={p.id}
                      type="button"
                      title={p.name}
                      onClick={() => onChangeTypeColor(t.id, p.id)}
                      style={{
                        backgroundColor: p.accentStrong,
                        // [2026-10-08] boxShadow THUAN (khong dung class
                        // ring-offset-* cua Tailwind) - modal nen kinh mo
                        // (backdrop-filter blur), ring-offset mac dinh gia
                        // dinh nen DUOI la mau DAC (thuong trang), dung
                        // inline shadow tu ve "vien trang" + "vien dam khi
                        // selected" chac chan dung mau, khong le qua lop
                        // kinh ben duoi.
                        boxShadow: selected
                          ? "0 0 0 2px #ffffff, 0 0 0 4px var(--mset-text-primary)"
                          : "0 0 0 1px rgba(0,0,0,.10)",
                      }}
                      className="flex size-7 shrink-0 cursor-pointer items-center justify-center rounded-full transition-transform duration-150 ease-out hover:scale-110"
                    >
                      {selected && <Check size={13} strokeWidth={3} className="text-white drop-shadow" />}
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </Section>
  );
}
