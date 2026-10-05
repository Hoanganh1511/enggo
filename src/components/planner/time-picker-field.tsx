"use client";

import { useEffect, useRef, useState } from "react";
import { Check, Clock, ChevronDown, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { PopoverRoot, PopoverTrigger, PopoverContent, PopoverClose } from "@/components/ui/popover";

// [2026-10-05] Time picker RIENG cho Planner - yeu cau nguoi dung: thay
// `<input type="time">` + `<input type="number">` (native, xau/kho dung)
// bang 1 control thong nhat, "combine #1 + #5 + #7" tu 7 huong design user
// gui: #1 danh sach gio (click 1 cai la xong, khong phai chon gio-roi-phut 2
// buoc), #5 quan ly "time block" (start + thoi luong, KHOP DUNG data model
// san co: scheduledMinute + durationMinutes, khong can quy doi qua lai gio
// KET THUC rieng), #7 go tay + goi y cho power user (vd go "9" hay "09:1" ra
// goi y loc dan).
const QUICK_SLOTS = Array.from({ length: 48 }, (_, i) => i * 30); // 00:00 -> 23:30, cach 30 phut
const QUICK_DURATIONS = [30, 60, 90, 120];

function pad2(n: number): string {
  return n.toString().padStart(2, "0");
}
function formatHM(minutes: number): string {
  return `${pad2(Math.floor(minutes / 60) % 24)}:${pad2(minutes % 60)}`;
}
function formatDuration(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h === 0) return `${m} phút`;
  if (m === 0) return `${h} giờ`;
  return `${h} giờ ${m} phút`;
}
function nowRoundedMinutes(): number {
  const d = new Date();
  const raw = d.getHours() * 60 + d.getMinutes();
  return Math.round(raw / 15) * 15; // lam tron ve moc 15 phut gan nhat, gon hon de lam diem xuat phat cho "+15/+30/+1h"
}
// Go tay LINH HOAT (khong gioi han boc trong luoi 30 phut cua danh sach goi
// y ben duoi) - cho phep nhap gio LE (vd "09:17") giong vi du #7 nguoi dung
// dua ra. Chap nhan "9", "930", "9:3", "09:30"... - h dau (1-2 so) + phut
// sau (0-2 so, thieu thi coi la 0).
function parseTimeInput(raw: string): number | null {
  const cleaned = raw.trim();
  const m = /^(\d{1,2}):?(\d{0,2})$/.exec(cleaned);
  if (!m) return null;
  const h = Number(m[1]);
  const min = m[2] ? Number(m[2].padEnd(2, "0")) : 0;
  if (h > 23 || min > 59) return null;
  return h * 60 + min;
}
// Loc danh sach goi y THEO tung chu so da go (vd "91" -> khop gio bat dau
// bang "9" + phut bat dau bang "1") - khong phai so sanh chuoi tuyet doi,
// tranh go "9" la mat het goi y chi vi khac "09".
function filterSlots(raw: string, slots: number[]): number[] {
  const digits = raw.replace(/\D/g, "");
  if (!digits) return slots;
  const hourPart = digits.slice(0, 2);
  const minutePart = digits.slice(2);
  return slots.filter((slot) => {
    const hStr = pad2(Math.floor(slot / 60));
    const mStr = pad2(slot % 60);
    const hourMatches = hStr.startsWith(hourPart) || (hourPart.length === 1 && hStr[1] === hourPart);
    return hourMatches && (minutePart === "" || mStr.startsWith(minutePart));
  });
}

export function TimePickerField({
  startMinute,
  durationMinutes,
  onChange,
}: {
  startMinute: number | null;
  durationMinutes: number;
  onChange: (startMinute: number | null, durationMinutes: number) => void;
}) {
  const [open, setOpen] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const selectedSlotRef = useRef<HTMLButtonElement>(null);

  // Focus input NGAY luc mo (section 12 "focus input khi mở") + cuon san
  // toi gio DANG CHON (hoac gio gan hien tai neu chua chon) vao GIUA khung
  // list (section 12 "selected time tự scroll vào giữa viewport").
  useEffect(() => {
    if (!open) return;
    const t = setTimeout(() => {
      setInputValue("");
      inputRef.current?.focus();
      selectedSlotRef.current?.scrollIntoView({ block: "center" });
    }, 0);
    return () => clearTimeout(t);
  }, [open]);

  function commitStart(minutes: number) {
    onChange(minutes, durationMinutes);
  }
  function applyQuickOffset(offset: number) {
    const base = startMinute ?? nowRoundedMinutes();
    commitStart(Math.max(0, Math.min(23 * 60 + 59, base + offset)));
  }
  function commitManualInput() {
    const parsed = parseTimeInput(inputValue);
    if (parsed === null) return;
    commitStart(parsed);
    setInputValue("");
  }

  const filteredSlots = filterSlots(inputValue, QUICK_SLOTS);
  const hasTime = startMinute !== null;

  return (
    <PopoverRoot open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          className={cn(
            "flex h-9 shrink-0 cursor-pointer items-center gap-1.5 rounded-[9px] border border-[color:var(--planner-border-soft)] bg-white px-2.5 text-[13px] outline-none transition-colors duration-150 ease-out hover:border-[color:var(--planner-border)]",
            hasTime ? "text-[color:var(--planner-text-primary)]" : "text-[color:var(--planner-text-muted)]",
          )}
        >
          <Clock size={13} className="shrink-0 text-[color:var(--planner-text-muted)]" />
          {hasTime ? (
            <span className="font-medium whitespace-nowrap">
              {formatHM(startMinute)} <span className="text-[color:var(--planner-text-muted)]">→</span>{" "}
              {formatHM(startMinute + durationMinutes)}
            </span>
          ) : (
            <span className="whitespace-nowrap">Đặt giờ</span>
          )}
          {hasTime && (
            <span
              role="button"
              tabIndex={0}
              onClick={(e) => {
                e.stopPropagation();
                onChange(null, durationMinutes);
              }}
              className="ml-0.5 flex size-4 cursor-pointer items-center justify-center rounded-full text-[color:var(--planner-text-muted)] hover:bg-[var(--planner-surface-soft)] hover:text-[color:var(--planner-text-secondary)]"
              aria-label="Bỏ giờ"
            >
              <X size={11} />
            </span>
          )}
          <ChevronDown size={13} className="ml-auto shrink-0 text-[color:var(--planner-text-muted)]" />
        </button>
      </PopoverTrigger>
      {/* [2026-10-05] align="end" (truoc day "start") - bug phat hien qua
          test luong tuong tac: nut nay thuong nam SAT CANH PHAI cua 1
          sidebar HEP (380px, xem DayDetailPanel.tsx), align="start" neo
          CANH TRAI cua popover vao canh trai nut -> popover rong 250px tran
          HAN ra khoi sidebar, "troi" qua khoang trong gray ben ngoai card.
          align="end" neo CANH PHAI cua popover vao canh phai nut thay vi -
          popover mo RONG VE BEN TRAI, luon nam gon trong pham vi sidebar. */}
      <PopoverContent
        open={open}
        align="end"
        className="z-50 w-[250px] rounded-[12px] border border-[color:var(--planner-border)] bg-white p-3 shadow-[0_8px_24px_rgba(20,30,50,.1)]"
      >
        <div className="flex items-center justify-between gap-2">
          <p className="text-[14px] font-semibold text-[color:var(--planner-text-primary)]">Chọn thời gian</p>
          <PopoverClose className="flex size-5 cursor-pointer items-center justify-center rounded text-[color:var(--planner-text-muted)] hover:bg-[var(--planner-surface-soft)]">
            <X size={13} />
          </PopoverClose>
        </div>

        {/* Go tay (#7) - go gio LE bat ky (vd "09:17"), Enter de chon. Danh
            sach ben duoi tu LOC theo tung chu so da go. */}
        <input
          ref={inputRef}
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") commitManualInput();
          }}
          placeholder="vd: 09:30"
          className="mt-2 h-8 w-full rounded-[8px] border border-[color:var(--planner-border-soft)] bg-[var(--planner-surface-soft)] px-2.5 text-[13px] text-[color:var(--planner-text-primary)] outline-none focus:border-[#b9c9ef] focus:bg-white"
        />

        {/* Thoi gian nhanh (section 11) - offset tu gio dang chon (hoac hien
            tai neu chua chon). */}
        <div className="mt-2.5 flex flex-col gap-1">
          <p className="text-[11px] font-medium text-[color:var(--planner-text-muted)]">Thời gian nhanh</p>
          <div className="flex flex-wrap gap-1">
            <button
              type="button"
              onClick={() => commitStart(nowRoundedMinutes())}
              className="cursor-pointer rounded-full border border-[color:var(--planner-border-soft)] px-2 py-1 text-[11.5px] font-medium text-[color:var(--planner-text-secondary)] hover:bg-[var(--planner-surface-soft)]"
            >
              Bây giờ
            </button>
            {[15, 30, 60].map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => applyQuickOffset(m)}
                className="cursor-pointer rounded-full border border-[color:var(--planner-border-soft)] px-2 py-1 text-[11.5px] font-medium text-[color:var(--planner-text-secondary)] hover:bg-[var(--planner-surface-soft)]"
              >
                +{m < 60 ? `${m} phút` : "1 giờ"}
              </button>
            ))}
          </div>
        </div>

        {/* Danh sach gio (#1) - 2 cot, cach 30 phut, cuon rieng. */}
        <div ref={listRef} className="mt-2.5 grid max-h-[180px] grid-cols-2 gap-x-1.5 gap-y-0.5 overflow-y-auto">
          {filteredSlots.length === 0 ? (
            <p className="col-span-2 py-3 text-center text-[12px] text-[color:var(--planner-text-muted)]">
              Không có gợi ý khớp
            </p>
          ) : (
            filteredSlots.map((slot) => {
              const selected = startMinute === slot;
              return (
                <button
                  key={slot}
                  ref={selected ? selectedSlotRef : undefined}
                  type="button"
                  onClick={() => commitStart(slot)}
                  className={cn(
                    "flex cursor-pointer items-center justify-between rounded-[7px] px-2 py-1.5 text-[13px] font-medium transition-colors duration-150 ease-out",
                    selected
                      ? "bg-[color:var(--planner-primary-soft)] text-[color:var(--planner-primary)]"
                      : "text-[color:var(--planner-text-secondary)] hover:bg-[var(--planner-surface-soft)]",
                  )}
                >
                  {formatHM(slot)}
                  {selected && <Check size={13} />}
                </button>
              );
            })
          )}
        </div>

        {/* Thoi luong (#5, "time block" thay vi 1 moc gio don) - CHI co y
            nghia khi da chon gio bat dau. */}
        {hasTime && (
          <div className="mt-2.5 flex flex-col gap-1 border-t border-[color:var(--planner-border-soft)] pt-2.5">
            <p className="text-[11px] font-medium text-[color:var(--planner-text-muted)]">
              Thời lượng · {formatDuration(durationMinutes)}
            </p>
            <div className="flex flex-wrap gap-1">
              {QUICK_DURATIONS.map((d) => (
                <button
                  key={d}
                  type="button"
                  onClick={() => onChange(startMinute, d)}
                  className={cn(
                    "cursor-pointer rounded-full border px-2 py-1 text-[11.5px] font-medium transition-colors duration-150 ease-out",
                    durationMinutes === d
                      ? "border-[color:var(--planner-primary)] bg-[color:var(--planner-primary-soft)] text-[color:var(--planner-primary)]"
                      : "border-[color:var(--planner-border-soft)] text-[color:var(--planner-text-secondary)] hover:bg-[var(--planner-surface-soft)]",
                  )}
                >
                  {formatDuration(d)}
                </button>
              ))}
            </div>
          </div>
        )}
      </PopoverContent>
    </PopoverRoot>
  );
}
