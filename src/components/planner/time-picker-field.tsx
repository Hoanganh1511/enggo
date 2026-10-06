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
  // [2026-10-06] "Bắt đầu"/"Kết thúc" - yeu cau nguoi dung: "điều chỉnh lại
  // sao cho UI/UX rõ ràng nhận biết về lựa chọn thời gian bắt đầu tới thời
  // gian kết thúc". Truoc day CHI co 1 danh sach chon GIO BAT DAU + rieng 1
  // hang chip THOI LUONG co dinh (30/60/90/120p) - khong co cach nao chon
  // TRUC TIEP gio KET THUC, nguoi dung phai tu quy doi nham trong dau. Them
  // 2 "tab" Bắt đầu/Kết thúc chuyen doi muc tieu cho CHINH 1 danh sach gio +
  // o nhap tay + nut nhanh hien co (tai su dung, khong tao UI rieng trung
  // lap) - "Kết thúc" tinh nguoc lai durationMinutes = end - start thay vi
  // luu truc tiep (khop dung data model scheduledMinute+durationMinutes san
  // co, khong doi schema).
  const [mode, setMode] = useState<"start" | "end">("start");
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
      setMode("start");
      inputRef.current?.focus();
      selectedSlotRef.current?.scrollIntoView({ block: "center" });
    }, 0);
    return () => clearTimeout(t);
  }, [open]);

  // Doi tab Bắt đầu/Kết thúc (khong dong/mo lai popover) - cuon list toi
  // dung gia tri DANG duoc chon cua tab MOI, tranh nguoi dung phai tu cuon
  // tim lai moi lan chuyen tab.
  useEffect(() => {
    if (!open) return;
    const t = setTimeout(() => {
      selectedSlotRef.current?.scrollIntoView({ block: "center" });
    }, 0);
    return () => clearTimeout(t);
  }, [mode, open]);

  const hasTime = startMinute !== null;
  const endMinute = startMinute !== null ? startMinute + durationMinutes : null;

  function commitStart(minutes: number) {
    onChange(minutes, durationMinutes);
  }
  // Toi thieu 15 phut - tranh tao 1 "time block" rong/am khi nguoi dung chon
  // gio ket thuc SOM HON hoac TRUNG gio bat dau.
  function commitEnd(minutes: number) {
    const base = startMinute ?? nowRoundedMinutes();
    onChange(base, Math.max(15, minutes - base));
  }
  function applyQuickOffset(offset: number) {
    if (mode === "end" && hasTime) {
      onChange(startMinute, Math.max(15, durationMinutes + offset));
      return;
    }
    const base = startMinute ?? nowRoundedMinutes();
    commitStart(Math.max(0, Math.min(23 * 60 + 59, base + offset)));
  }
  function commitManualInput() {
    const parsed = parseTimeInput(inputValue);
    if (parsed === null) return;
    if (mode === "end") commitEnd(parsed);
    else commitStart(parsed);
    setInputValue("");
  }

  const filteredSlots = filterSlots(inputValue, QUICK_SLOTS);

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
          {hasTime && endMinute !== null ? (
            <span className="font-medium whitespace-nowrap">
              {formatHM(startMinute)} <span className="text-[color:var(--planner-text-muted)]">→</span>{" "}
              {formatHM(endMinute)}
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
        className="z-50 w-[270px] rounded-[12px] border border-[color:var(--planner-border)] bg-white p-3 shadow-[0_8px_24px_rgba(20,30,50,.1)]"
      >
        <div className="flex items-center justify-between gap-2">
          <p className="text-[14px] font-semibold text-[color:var(--planner-text-primary)]">Chọn thời gian</p>
          <PopoverClose className="flex size-5 cursor-pointer items-center justify-center rounded text-[color:var(--planner-text-muted)] hover:bg-[var(--planner-surface-soft)]">
            <X size={13} />
          </PopoverClose>
        </div>

        {/* [2026-10-06] "Bắt đầu"/"Kết thúc" dang 2 tab co the bam - yeu cau
            nguoi dung: "UI/UX rõ ràng nhận biết về lựa chọn thời gian bắt
            đầu tới thời gian kết thúc". La TRUNG TAM cua redesign nay: 1 cap
            nut hien SONG SONG ca 2 moc gio + mui ten noi giua, bam vao tab
            nao thi danh sach/o nhap/nut nhanh ben duoi chuyen sang CHINH SUA
            dung moc do (xem `mode`) - thay vi truoc day CHI co the chon gio
            BAT DAU, gio KET THUC la "an so" suy ra tu 1 hang chip thoi luong
            tach roi, de nham. Tab "Kết thúc" khoa (disabled) khi CHUA chon
            gio bat dau - khong co y nghia gi neu chua co diem xuat phat. */}
        <div className="mt-2.5 flex items-stretch gap-1">
          <button
            type="button"
            onClick={() => setMode("start")}
            className={cn(
              "flex flex-1 cursor-pointer flex-col items-start gap-0.5 rounded-[8px] border px-2.5 py-1.5 text-left transition-colors duration-150 ease-out",
              mode === "start"
                ? "border-[color:var(--planner-primary)] bg-[color:var(--planner-primary-soft)]"
                : "border-[color:var(--planner-border-soft)] hover:bg-[var(--planner-surface-soft)]",
            )}
          >
            <span className="text-[10.5px] font-medium tracking-wide text-[color:var(--planner-text-muted)] uppercase">
              Bắt đầu
            </span>
            <span
              className={cn(
                "text-[14px] font-semibold tabular-nums",
                mode === "start" ? "text-[color:var(--planner-primary)]" : "text-[color:var(--planner-text-primary)]",
              )}
            >
              {hasTime ? formatHM(startMinute) : "--:--"}
            </span>
          </button>
          <div className="flex shrink-0 items-center text-[color:var(--planner-text-muted)]">→</div>
          <button
            type="button"
            disabled={!hasTime}
            onClick={() => setMode("end")}
            className={cn(
              "flex flex-1 cursor-pointer flex-col items-start gap-0.5 rounded-[8px] border px-2.5 py-1.5 text-left transition-colors duration-150 ease-out disabled:cursor-not-allowed disabled:opacity-50",
              mode === "end"
                ? "border-[color:var(--planner-primary)] bg-[color:var(--planner-primary-soft)]"
                : "border-[color:var(--planner-border-soft)] hover:bg-[var(--planner-surface-soft)]",
            )}
          >
            <span className="text-[10.5px] font-medium tracking-wide text-[color:var(--planner-text-muted)] uppercase">
              Kết thúc
            </span>
            <span
              className={cn(
                "text-[14px] font-semibold tabular-nums",
                mode === "end" ? "text-[color:var(--planner-primary)]" : "text-[color:var(--planner-text-primary)]",
              )}
            >
              {hasTime && endMinute !== null ? formatHM(endMinute) : "--:--"}
            </span>
          </button>
        </div>

        {/* Dai 24h thu nho - khoi mau the hien TRUC QUAN vi tri + do dai cua
            "time block" dang chon trong ca 1 ngay, cung tinh than voi chinh
            luoi gio o WeekTimeGrid (nhan manh 1 NGON NGU THI GIAC xuyen suot
            app, khong phai chi la con so). */}
        {hasTime && endMinute !== null && (
          <div className="relative mt-2 h-1.5 overflow-hidden rounded-full bg-[var(--planner-surface-soft)]">
            <div
              className="absolute inset-y-0 rounded-full bg-[color:var(--planner-primary)]"
              style={{
                left: `${(startMinute / 1440) * 100}%`,
                width: `${Math.max(1, (durationMinutes / 1440) * 100)}%`,
              }}
            />
          </div>
        )}

        {/* Go tay (#7) - go gio LE bat ky (vd "09:17"), Enter de chon. Danh
            sach ben duoi tu LOC theo tung chu so da go. Placeholder/gia tri
            commit THEO DUNG tab dang mo (Bắt đầu/Kết thúc, xem `mode`). */}
        <input
          ref={inputRef}
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") commitManualInput();
          }}
          placeholder={mode === "end" ? "Giờ kết thúc, vd: 11:00" : "Giờ bắt đầu, vd: 09:30"}
          className="mt-2 h-8 w-full rounded-[8px] border border-[color:var(--planner-border-soft)] bg-[var(--planner-surface-soft)] px-2.5 text-[13px] text-[color:var(--planner-text-primary)] outline-none focus:border-[#b9c9ef] focus:bg-white"
        />

        {/* Thoi gian nhanh (section 11) - offset tu moc GIO DANG CHINH SUA
            (Bắt đầu hoac Kết thúc tuy `mode`, hoac hien tai neu chua chon
            gio nao). */}
        <div className="mt-2.5 flex flex-col gap-1">
          <p className="text-[11px] font-medium text-[color:var(--planner-text-muted)]">
            {mode === "end" ? "Kết thúc nhanh" : "Bắt đầu nhanh"}
          </p>
          <div className="flex flex-wrap gap-1">
            <button
              type="button"
              onClick={() => (mode === "end" ? commitEnd(nowRoundedMinutes()) : commitStart(nowRoundedMinutes()))}
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

        {/* Danh sach gio (#1) - 2 cot, cach 30 phut, cuon rieng. Chon slot
            nao se gan cho moc DANG MO (Bắt đầu/Kết thúc, xem `mode` + tab o
            tren) - selected/onClick deu doc theo dung moc do. */}
        <p className="mt-2.5 text-[11px] font-medium text-[color:var(--planner-text-muted)]">
          {mode === "end" ? "Chọn giờ kết thúc" : "Chọn giờ bắt đầu"}
        </p>
        <div ref={listRef} className="mt-1 grid max-h-[180px] grid-cols-2 gap-x-1.5 gap-y-0.5 overflow-y-auto">
          {filteredSlots.length === 0 ? (
            <p className="col-span-2 py-3 text-center text-[12px] text-[color:var(--planner-text-muted)]">
              Không có gợi ý khớp
            </p>
          ) : (
            filteredSlots.map((slot) => {
              const selected = mode === "end" ? endMinute === slot : startMinute === slot;
              return (
                <button
                  key={slot}
                  ref={selected ? selectedSlotRef : undefined}
                  type="button"
                  onClick={() => (mode === "end" ? commitEnd(slot) : commitStart(slot))}
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

        {/* Thoi luong (#5, "time block" thay vi 1 moc gio don) - loi tat CHINH
            "Kết thúc" theo do dai thay vi theo 1 moc gio cu the (tuong duong
            ve ket qua, chi khac cach nghi) - CHI co y nghia khi da chon gio
            bat dau. */}
        {hasTime && (
          <div className="mt-2.5 flex flex-col gap-1 border-t border-[color:var(--planner-border-soft)] pt-2.5">
            <p className="text-[11px] font-medium text-[color:var(--planner-text-muted)]">
              Hoặc chọn nhanh thời lượng · {formatDuration(durationMinutes)}
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
