"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { SimpleModal } from "@/components/ui/simple-modal";
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

// [2026-10-07] Settings modal cua Planner - yeu cau nguoi dung: "Phần chọn
// bộ màu pastel config cho planner giờ để nó trong setting nhé. Icon setting
// bổ sung vào cuối thanh toolbar trên cùng... Setting sẽ là một modal to".
// Dung SimpleModal (khung modal CHUNG toan app, xem simple-modal.tsx) - LUU
// Y: SimpleModal render qua Dialog.Portal (gan thang vao document.body),
// NAM NGOAI div ".planner-scope" (noi dinh nghia cac bien --planner-*) nen
// KHONG dung token --planner-* o day duoc (se resolve ra rong/invalid) - CO
// CHU DICH dung token toan app (--ink/--border/--surface...) nhu chinh
// SimpleModal da lam cho phan khung/header cua no, khong phai thieu sot.
//
// 3 "trang" dieu huong NOI BO (khong phai route rieng, chi 1 state):
// "main" (View/Calendar/Task appearance + dong "Colors →") -> "colors"
// (tom tat 4 Type dang dung palette nao, read-only) -> "palette" (luoi 14
// mau TUONG TAC that su cho tung Type - phuc hoi lai UI TypeColorSettings
// da bi xoa truoc do, xem comment o PlannerShell.tsx cho boi canh).
//
// KHONG co nut Save/Cancel nao - MOI thay doi ap dung NGAY (goi
// usePlannerSettings().update(), da tu optimistic-update + goi API ngam),
// khop dung mockup nguoi dung gui (khong co nut Save) va dung quy uoc "instant
// apply" da co san trong Planner (vd doi Type/Priority truoc gio).
export function PlannerSettingsModal({
  open,
  onOpenChange,
  onChangeTypeColor,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onChangeTypeColor: (type: LifeItemType, paletteId: string) => void;
}) {
  const [page, setPage] = useState<"main" | "colors" | "palette">("main");
  const { settings, update } = usePlannerSettings();
  const overrides = useTypeColorOverrides();

  function handleOpenChange(next: boolean) {
    onOpenChange(next);
    if (!next) setPage("main");
  }

  const title =
    page === "main" ? "Cài đặt" : page === "colors" ? "Colors" : "Customize palette";

  return (
    <SimpleModal
      open={open}
      onOpenChange={handleOpenChange}
      title={title}
      maxWidthClassName="max-w-2xl"
    >
      {page === "main" && (
        <MainPage settings={settings} update={update} onOpenColors={() => setPage("colors")} />
      )}
      {page === "colors" && (
        <ColorsPage
          overrides={overrides}
          onBack={() => setPage("main")}
          onOpenPalette={() => setPage("palette")}
        />
      )}
      {page === "palette" && (
        <PalettePage
          overrides={overrides}
          onBack={() => setPage("colors")}
          onChangeTypeColor={onChangeTypeColor}
        />
      )}
    </SimpleModal>
  );
}

function SettingsSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-3 border-t border-border py-4 first:border-t-0 first:pt-0">
      <p className="text-xs font-bold tracking-[.06em] text-ink-muted uppercase">{title}</p>
      {children}
    </div>
  );
}

function SettingsRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-sm font-medium text-ink">{label}</span>
      {children}
    </div>
  );
}

// Segmented control dung chung (thay radio native) - cung tinh than
// TypePickerRow/PriorityPickerRow da co san trong PlannerShell.tsx, o day
// viet lai ban NHO GON hon (chi chu, khong icon) vi dung cho cac option
// nhu "Monday/Sunday", "24-hour/12-hour"...
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
    <div className="flex items-center gap-1 rounded-lg border border-border bg-surface-muted p-0.5">
      {options.map((o) => (
        <button
          key={String(o.value)}
          type="button"
          onClick={() => onChange(o.value)}
          className={cn(
            "cursor-pointer rounded-md px-2.5 py-1 text-xs font-semibold whitespace-nowrap transition-colors duration-150 ease-out",
            value === o.value
              ? "bg-surface text-ink shadow-sm"
              : "text-ink-muted hover:text-ink",
          )}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

function CheckboxRow({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <label className="flex cursor-pointer items-center justify-between gap-3">
      <span className="text-sm font-medium text-ink">{label}</span>
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="size-4 cursor-pointer accent-primary"
      />
    </label>
  );
}

function HourNumberField({
  value,
  onChange,
}: {
  value: number;
  onChange: (v: number) => void;
}) {
  return (
    <input
      type="number"
      min={0}
      max={23}
      value={value}
      onChange={(e) => {
        const v = Math.min(23, Math.max(0, Number(e.target.value) || 0));
        onChange(v);
      }}
      className="h-8 w-16 rounded-md border border-input-border bg-input-bg px-2 text-center text-sm text-input-text outline-none focus:border-input-focus"
    />
  );
}

function MainPage({
  settings,
  update,
  onOpenColors,
}: {
  settings: PlannerSettings;
  update: (patch: Partial<Omit<PlannerSettings, "userId">>) => void;
  onOpenColors: () => void;
}) {
  return (
    <div className="flex flex-col">
      <SettingsSection title="View">
        <SettingsRow label="Week starts on">
          <SegmentedControl
            value={settings.weekStartsOn}
            options={[
              { value: "MONDAY", label: "Monday" },
              { value: "SUNDAY", label: "Sunday" },
            ]}
            onChange={(v) => update({ weekStartsOn: v })}
          />
        </SettingsRow>
        <SettingsRow label="Time format">
          <SegmentedControl
            value={settings.timeFormat}
            options={[
              { value: "24H", label: "24-hour" },
              { value: "12H", label: "12-hour" },
            ]}
            onChange={(v) => update({ timeFormat: v })}
          />
        </SettingsRow>
        <CheckboxRow
          label="Show weekends"
          checked={settings.showWeekends}
          onChange={(v) => update({ showWeekends: v })}
        />
        <CheckboxRow
          label="Show all-day section"
          checked={settings.showAllDaySection}
          onChange={(v) => update({ showAllDaySection: v })}
        />
        <SettingsRow label="Density">
          <SegmentedControl
            value={settings.density}
            options={[
              { value: "COMFORTABLE", label: "Comfortable" },
              { value: "COMPACT", label: "Compact" },
            ]}
            onChange={(v) => update({ density: v })}
          />
        </SettingsRow>
      </SettingsSection>

      <SettingsSection title="Calendar">
        <SettingsRow label="Working hours">
          <TimePickerField
            startMinute={settings.workingHoursStart}
            durationMinutes={Math.max(settings.workingHoursEnd - settings.workingHoursStart, 15)}
            onChange={(s, d) =>
              update({ workingHoursStart: s ?? 0, workingHoursEnd: (s ?? 0) + d })
            }
          />
        </SettingsRow>
        <SettingsRow label="First visible hour">
          <HourNumberField
            value={settings.firstVisibleHour}
            onChange={(v) => update({ firstVisibleHour: Math.min(v, settings.lastVisibleHour - 1) })}
          />
        </SettingsRow>
        <SettingsRow label="Last visible hour">
          <HourNumberField
            value={settings.lastVisibleHour === 24 ? 23 : settings.lastVisibleHour}
            onChange={(v) => update({ lastVisibleHour: Math.max(v + 1, settings.firstVisibleHour + 1) })}
          />
        </SettingsRow>
        <SettingsRow label="Time slot">
          <SegmentedControl
            value={settings.timeSlotMinutes}
            options={[
              { value: 15, label: "15 min" },
              { value: 30, label: "30 min" },
              { value: 60, label: "60 min" },
            ]}
            onChange={(v) => update({ timeSlotMinutes: v })}
          />
        </SettingsRow>
      </SettingsSection>

      <SettingsSection title="Task appearance">
        <p className="text-xs font-semibold text-ink-muted">Show</p>
        <CheckboxRow label="Task type" checked={settings.showTaskType} onChange={(v) => update({ showTaskType: v })} />
        <CheckboxRow label="Duration" checked={settings.showDuration} onChange={(v) => update({ showDuration: v })} />
        <CheckboxRow label="Area" checked={settings.showArea} onChange={(v) => update({ showArea: v })} />
        <CheckboxRow label="Project" checked={settings.showProject} onChange={(v) => update({ showProject: v })} />
        <CheckboxRow label="Priority" checked={settings.showPriority} onChange={(v) => update({ showPriority: v })} />

        <SettingsRow label="Completed tasks">
          <SegmentedControl
            value={settings.completedTaskDisplay}
            options={[
              { value: "KEEP_VISIBLE", label: "Keep visible" },
              { value: "COLLAPSE", label: "Collapse" },
              { value: "HIDE", label: "Hide" },
            ]}
            onChange={(v) => update({ completedTaskDisplay: v })}
          />
        </SettingsRow>
        <SettingsRow label="Completed task style">
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
        </SettingsRow>
      </SettingsSection>

      <div className="border-t border-border pt-1">
        <button
          type="button"
          onClick={onOpenColors}
          className="flex w-full cursor-pointer items-center justify-between gap-2 rounded-lg px-1 py-2.5 text-left transition-colors duration-150 ease-out hover:bg-hover-bg"
        >
          <span className="text-sm font-semibold text-ink">Colors</span>
          <ChevronRight size={15} className="text-ink-faint" />
        </button>
      </div>
    </div>
  );
}

function BackHeader({ label, onBack }: { label: string; onBack: () => void }) {
  return (
    <button
      type="button"
      onClick={onBack}
      className="mb-3 flex cursor-pointer items-center gap-1 text-xs font-semibold text-ink-muted hover:text-ink"
    >
      <ChevronLeft size={13} /> {label}
    </button>
  );
}

function ColorsPage({
  overrides,
  onBack,
  onOpenPalette,
}: {
  overrides: Partial<Record<LifeItemType, string>>;
  onBack: () => void;
  onOpenPalette: () => void;
}) {
  return (
    <div className="flex flex-col">
      <BackHeader label="Cài đặt" onBack={onBack} />
      <p className="mb-2 text-xs font-bold tracking-[.06em] text-ink-muted uppercase">Task type colors</p>
      <div className="flex flex-col gap-1">
        {LIFE_ITEM_TYPES.map((t) => {
          const palette = resolveLifeItemPalette(t.id, overrides);
          return (
            <div key={t.id} className="flex items-center justify-between gap-3 rounded-lg px-1 py-2">
              <span className="flex items-center gap-2 text-sm font-medium text-ink">
                <span aria-hidden="true">{t.icon}</span> {t.label}
              </span>
              <span className="flex items-center gap-1.5 text-sm text-ink-muted">
                <span
                  className="size-3.5 shrink-0 rounded-full"
                  style={{ backgroundColor: palette.accentStrong }}
                  aria-hidden="true"
                />
                {palette.name}
              </span>
            </div>
          );
        })}
      </div>
      <button
        type="button"
        onClick={onOpenPalette}
        className="mt-3 flex w-full cursor-pointer items-center justify-between gap-2 rounded-lg border-t border-border px-1 pt-3 pb-1 text-left transition-colors duration-150 ease-out hover:bg-hover-bg"
      >
        <span className="text-sm font-semibold text-ink">Customize palette</span>
        <ChevronRight size={15} className="text-ink-faint" />
      </button>
    </div>
  );
}

function PalettePage({
  overrides,
  onBack,
  onChangeTypeColor,
}: {
  overrides: Partial<Record<LifeItemType, string>>;
  onBack: () => void;
  onChangeTypeColor: (type: LifeItemType, paletteId: string) => void;
}) {
  return (
    <div className="flex flex-col">
      <BackHeader label="Colors" onBack={onBack} />
      <div className="flex flex-col gap-4">
        {LIFE_ITEM_TYPES.map((t) => {
          const current = overrides[t.id] ?? t.defaultPaletteId;
          return (
            <div key={t.id} className="flex flex-col gap-1.5">
              <span className="flex items-center gap-1.5 text-sm font-semibold text-ink">
                <span aria-hidden="true">{t.icon}</span> {t.label}
              </span>
              <div className="flex flex-wrap gap-1.5">
                {LIFE_ITEM_PALETTES.map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    title={p.name}
                    onClick={() => onChangeTypeColor(t.id, p.id)}
                    style={{ backgroundColor: p.accentStrong }}
                    className={cn(
                      "flex size-6 shrink-0 cursor-pointer items-center justify-center rounded-full ring-1 ring-black/10 ring-offset-1 ring-offset-surface transition-transform duration-150 ease-out hover:scale-110",
                      current === p.id && "outline-2 outline-offset-1 outline-ink",
                    )}
                  >
                    {current === p.id && <Check size={12} strokeWidth={3} className="text-white drop-shadow" />}
                  </button>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
