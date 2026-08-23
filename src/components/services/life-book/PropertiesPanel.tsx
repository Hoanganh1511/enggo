"use client";

import { AlignCenter, AlignLeft, AlignRight, Bold, Italic, SendToBack, BringToFront, Underline } from "lucide-react";
import type { CanvasElementData } from "@/lib/life-book/canvas-elements";
import { GOOGLE_FONT_OPTIONS, ensureGoogleFontLoaded } from "@/lib/life-book/google-fonts";
import { resizeTableCells } from "@/lib/life-book/table-utils";

const LABEL_CLASS = "px-1 text-[11px] font-semibold tracking-wide text-ink-faint uppercase";
const NUMBER_INPUT_CLASS =
  "w-full rounded-md border border-border bg-white px-2 py-1 text-xs text-ink focus:border-ink-faint focus:outline-none";
const TOGGLE_BASE_CLASS =
  "grid size-7 cursor-pointer place-items-center rounded-md border transition-colors duration-150 ease-out";

function toggleClass(active: boolean) {
  return `${TOGGLE_BASE_CLASS} ${
    active
      ? "border-ink bg-ink text-white"
      : "border-border bg-white text-ink-muted hover:bg-hover-bg"
  }`;
}

// Panel Properties (Sub-phase 6.5) - hien thi field CHUNG (x/y/width/height/
// rotation/z-index) khi co it nhat 1 element duoc chon, va field RIENG theo
// loai (font/mau/can le cho text; opacity/bo goc cho anh/sticker; hang-cot
// cho bang) CHI khi dung 1 element duoc chon - chon nhieu voi cac loai/gia
// tri khac nhau thi khong co 1 gia tri chung de hien thi trung thuc, nen chi
// con lai thao tac layer (dua len tren cung/xuong duoi cung) ap dung duoc
// cho ca nhom.
export function PropertiesPanel({
  elements,
  selectedIds,
  onUpdateElement,
  onReorder,
}: {
  elements: CanvasElementData[];
  selectedIds: Set<string>;
  onUpdateElement: (id: string, patch: Partial<CanvasElementData>) => void;
  onReorder: (ids: Set<string>, direction: "front" | "back") => void;
}) {
  const selected = elements.filter((el) => selectedIds.has(el.id));

  if (selected.length === 0) {
    return (
      <p className="text-xs text-ink-faint">Chọn 1 phần tử trên canvas để chỉnh sửa.</p>
    );
  }

  const single = selected.length === 1 ? selected[0] : null;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <p className={LABEL_CLASS}>Lớp (Z-index)</p>
        <div className="flex gap-1.5">
          <button
            type="button"
            onClick={() => onReorder(selectedIds, "front")}
            className="flex flex-1 cursor-pointer items-center justify-center gap-1.5 rounded-lg border border-border bg-white px-2 py-1.5 text-xs font-medium text-ink transition-colors duration-150 ease-out hover:bg-hover-bg"
          >
            <BringToFront size={14} /> Lên trên cùng
          </button>
          <button
            type="button"
            onClick={() => onReorder(selectedIds, "back")}
            className="flex flex-1 cursor-pointer items-center justify-center gap-1.5 rounded-lg border border-border bg-white px-2 py-1.5 text-xs font-medium text-ink transition-colors duration-150 ease-out hover:bg-hover-bg"
          >
            <SendToBack size={14} /> Xuống dưới cùng
          </button>
        </div>
      </div>

      {!single && (
        <p className="text-xs text-ink-faint">
          Đang chọn {selected.length} phần tử — chọn đúng 1 phần tử để chỉnh vị trí/kích
          thước/nội dung chi tiết.
        </p>
      )}

      {single && (
        <>
          <div className="flex flex-col gap-1.5">
            <p className={LABEL_CLASS}>Vị trí & kích thước</p>
            <div className="grid grid-cols-2 gap-1.5">
              <NumberField
                label="X"
                value={single.x}
                onChange={(v) => onUpdateElement(single.id, { x: v })}
              />
              <NumberField
                label="Y"
                value={single.y}
                onChange={(v) => onUpdateElement(single.id, { y: v })}
              />
              <NumberField
                label="Rộng"
                value={single.width}
                min={20}
                onChange={(v) => onUpdateElement(single.id, { width: v })}
              />
              <NumberField
                label="Cao"
                value={single.height}
                min={20}
                onChange={(v) => onUpdateElement(single.id, { height: v })}
              />
              <NumberField
                label="Xoay (°)"
                value={single.rotation}
                onChange={(v) => onUpdateElement(single.id, { rotation: v })}
              />
            </div>
          </div>

          {single.type === "text" && (
            <TextProperties element={single} onUpdateElement={onUpdateElement} />
          )}
          {(single.type === "image" || single.type === "sticker") && (
            <ImageLikeProperties element={single} onUpdateElement={onUpdateElement} />
          )}
          {single.type === "table" && (
            <TableProperties element={single} onUpdateElement={onUpdateElement} />
          )}
        </>
      )}
    </div>
  );
}

function NumberField({
  label,
  value,
  onChange,
  min,
}: {
  label: string;
  value: number;
  onChange: (value: number) => void;
  min?: number;
}) {
  return (
    <label className="flex flex-col gap-0.5">
      <span className="text-[10px] text-ink-faint">{label}</span>
      <input
        type="number"
        value={Math.round(value)}
        min={min}
        className={NUMBER_INPUT_CLASS}
        onChange={(e) => {
          const next = Number(e.target.value);
          if (Number.isNaN(next)) return;
          onChange(min !== undefined ? Math.max(min, next) : next);
        }}
      />
    </label>
  );
}

function TextProperties({
  element,
  onUpdateElement,
}: {
  element: Extract<CanvasElementData, { type: "text" }>;
  onUpdateElement: (id: string, patch: Partial<CanvasElementData>) => void;
}) {
  const isBold = element.fontStyle.includes("bold");
  const isItalic = element.fontStyle.includes("italic");
  const isUnderline = element.textDecoration === "underline";

  function toggleStyle(part: "bold" | "italic") {
    const has = part === "bold" ? isBold : isItalic;
    const other = part === "bold" ? isItalic : isBold;
    let next: string;
    if (has) {
      next = other ? (part === "bold" ? "italic" : "bold") : "normal";
    } else {
      next = other ? "bold italic" : part;
    }
    onUpdateElement(element.id, { fontStyle: next });
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-col gap-1.5">
        <p className={LABEL_CLASS}>Nội dung</p>
        <textarea
          value={element.text}
          rows={2}
          className="w-full resize-none rounded-md border border-border bg-white px-2 py-1.5 text-xs text-ink focus:border-ink-faint focus:outline-none"
          onChange={(e) => onUpdateElement(element.id, { text: e.target.value })}
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <p className={LABEL_CLASS}>Font chữ</p>
        <select
          value={element.fontFamily}
          className={NUMBER_INPUT_CLASS}
          onChange={(e) => {
            const option = GOOGLE_FONT_OPTIONS.find((f) => f.family === e.target.value);
            if (!option) return;
            ensureGoogleFontLoaded(option.googleParam);
            onUpdateElement(element.id, { fontFamily: option.family });
          }}
        >
          {GOOGLE_FONT_OPTIONS.map((f) => (
            <option key={f.family} value={f.family}>
              {f.label}
            </option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-2 gap-1.5">
        <NumberField
          label="Cỡ chữ"
          value={element.fontSize}
          min={6}
          onChange={(v) => onUpdateElement(element.id, { fontSize: v })}
        />
        <label className="flex flex-col gap-0.5">
          <span className="text-[10px] text-ink-faint">Màu chữ</span>
          <input
            type="color"
            value={element.fill}
            className="h-[26px] w-full cursor-pointer rounded-md border border-border bg-white p-0.5"
            onChange={(e) => onUpdateElement(element.id, { fill: e.target.value })}
          />
        </label>
      </div>

      <div className="flex flex-col gap-1.5">
        <p className={LABEL_CLASS}>Định dạng</p>
        <div className="flex gap-1.5">
          <button
            type="button"
            aria-label="In đậm"
            onClick={() => toggleStyle("bold")}
            className={toggleClass(isBold)}
          >
            <Bold size={14} />
          </button>
          <button
            type="button"
            aria-label="In nghiêng"
            onClick={() => toggleStyle("italic")}
            className={toggleClass(isItalic)}
          >
            <Italic size={14} />
          </button>
          <button
            type="button"
            aria-label="Gạch chân"
            onClick={() =>
              onUpdateElement(element.id, {
                textDecoration: isUnderline ? "" : "underline",
              })
            }
            className={toggleClass(isUnderline)}
          >
            <Underline size={14} />
          </button>
          <div className="mx-1 w-px bg-border" />
          <button
            type="button"
            aria-label="Căn trái"
            onClick={() => onUpdateElement(element.id, { align: "left" })}
            className={toggleClass(element.align === "left")}
          >
            <AlignLeft size={14} />
          </button>
          <button
            type="button"
            aria-label="Căn giữa"
            onClick={() => onUpdateElement(element.id, { align: "center" })}
            className={toggleClass(element.align === "center")}
          >
            <AlignCenter size={14} />
          </button>
          <button
            type="button"
            aria-label="Căn phải"
            onClick={() => onUpdateElement(element.id, { align: "right" })}
            className={toggleClass(element.align === "right")}
          >
            <AlignRight size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}

function ImageLikeProperties({
  element,
  onUpdateElement,
}: {
  element: Extract<CanvasElementData, { type: "image" | "sticker" }>;
  onUpdateElement: (id: string, patch: Partial<CanvasElementData>) => void;
}) {
  return (
    <div className="flex flex-col gap-3">
      <label className="flex flex-col gap-1">
        <span className={LABEL_CLASS}>Độ mờ ({Math.round(element.opacity * 100)}%)</span>
        <input
          type="range"
          min={0}
          max={1}
          step={0.01}
          value={element.opacity}
          className="w-full cursor-pointer"
          onChange={(e) => onUpdateElement(element.id, { opacity: Number(e.target.value) })}
        />
      </label>
      {element.type === "image" && (
        <NumberField
          label="Bo góc (px)"
          value={element.cornerRadius}
          min={0}
          onChange={(v) => onUpdateElement(element.id, { cornerRadius: v })}
        />
      )}
    </div>
  );
}

function TableProperties({
  element,
  onUpdateElement,
}: {
  element: Extract<CanvasElementData, { type: "table" }>;
  onUpdateElement: (id: string, patch: Partial<CanvasElementData>) => void;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <p className={LABEL_CLASS}>Bảng</p>
      <div className="grid grid-cols-3 gap-1.5">
        <NumberField
          label="Hàng"
          value={element.rows}
          min={1}
          onChange={(v) =>
            onUpdateElement(element.id, {
              rows: v,
              cells: resizeTableCells(element.cells, v, element.cols),
            })
          }
        />
        <NumberField
          label="Cột"
          value={element.cols}
          min={1}
          onChange={(v) =>
            onUpdateElement(element.id, {
              cols: v,
              cells: resizeTableCells(element.cells, element.rows, v),
            })
          }
        />
        <NumberField
          label="Đệm ô"
          value={element.cellPadding}
          min={0}
          onChange={(v) => onUpdateElement(element.id, { cellPadding: v })}
        />
      </div>
    </div>
  );
}
