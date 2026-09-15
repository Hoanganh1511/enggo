"use client";

import { useState } from "react";
import { ArrowDown, ArrowUp, ChevronDown, Plus, Trash2 } from "lucide-react";
import { PopoverRoot, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { SelectMenu } from "@/components/ui/select-menu";
import { RepeaterField, RemoveRowButton } from "@/components/series/RepeaterField";
import type {
  EntryBlockButton,
  EntryBlockButtonStyle,
  EntryContentBlock,
  EntryContentBlockZone,
} from "@/lib/api/content-series";

const inputClass =
  "w-full rounded-lg border border-border bg-surface px-3 py-2 text-[13px] outline-none focus:border-primary";

const BLOCK_TYPE_LABEL: Record<EntryContentBlock["type"], string> = {
  toc: "TOC dạng box (tự động theo H2)",
  install: "Box lệnh cài đặt",
  buttonGroup: "Nhóm nút",
  callout: "Vùng nhấn mạnh (full-width)",
  newsletter: "Đăng ký nhận email",
  botHelp: "Gợi ý hỏi bot",
  featurePromo: "Thẻ quảng bá (có ảnh)",
  deeperCourse: "Thẻ CTA (không ảnh)",
};

// Loai block cho phep TRONG TUNG zone - "top" giu nguyen 4 loai CU (thiet
// ke rieng cho vi tri duoi subtitle); "middle"/"bottom" CHI dung 4 loai MOI
// (newsletter/botHelp/featurePromo/deeperCourse) - yeu cau nguoi dung dung
// chung 1 bo 4 loai nay cho CA 2 vi tri giua/cuoi, tach biet voi 4 loai cu.
const ZONE_TYPES: Record<EntryContentBlockZone, EntryContentBlock["type"][]> = {
  top: ["toc", "install", "buttonGroup", "callout"],
  middle: ["newsletter", "botHelp", "featurePromo", "deeperCourse"],
  bottom: ["newsletter", "botHelp", "featurePromo", "deeperCourse"],
};

const BUTTON_STYLE_OPTIONS: { value: EntryBlockButtonStyle; label: string }[] = [
  { value: "solid-yellow", label: "Nền vàng, chữ đen" },
  { value: "outline-black", label: "Viền đen, chữ đen" },
  { value: "ghost-gray", label: "Không viền, chữ xám" },
];

function randomId(): string {
  return typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : Math.random().toString(36).slice(2);
}

function newBlock(type: EntryContentBlock["type"], zone: EntryContentBlockZone): EntryContentBlock {
  switch (type) {
    case "toc":
      return { id: randomId(), zone, type: "toc" };
    case "install":
      return { id: randomId(), zone, type: "install", command: "", description: "", buttons: [] };
    case "buttonGroup":
      return { id: randomId(), zone, type: "buttonGroup", buttons: [] };
    case "callout":
      return { id: randomId(), zone, type: "callout", title: "" };
    case "newsletter":
      return { id: randomId(), zone: zone === "top" ? "middle" : zone, type: "newsletter" };
    case "botHelp":
      return {
        id: randomId(),
        zone: zone === "top" ? "middle" : zone,
        type: "botHelp",
        title: "",
        description: "",
        buttonLabel: "",
        buttonUrl: "",
      };
    case "featurePromo":
      return {
        id: randomId(),
        zone: zone === "top" ? "middle" : zone,
        type: "featurePromo",
        imageUrl: "",
        title: "",
        buttonLabel: "",
        buttonUrl: "",
      };
    case "deeperCourse":
      return {
        id: randomId(),
        zone: zone === "top" ? "middle" : zone,
        type: "deeperCourse",
        title: "",
        buttonLabel: "",
        buttonUrl: "",
      };
  }
}

function newButton(): EntryBlockButton {
  return { id: randomId(), label: "", url: "", style: "outline-black" };
}

// Editor cho danh sach "khoi noi dung" CHEN duoc vao 1 trong 3 zone cua 1
// trang Entry - yeu cau nguoi dung (2026-09-15, mo rong tu ban dau "nua
// tren" duy nhat): "thêm 1 button + vào để cho phép người dùng thêm section
// vào giữa [Top va Than]... có cả dấu + ở cuối - sau phần thân". Component
// nay dung LAI 3 LAN trong SeriesEntryForm.tsx (zone="top"/"middle"/
// "bottom"), CA 3 lan CHIA SE 1 mang `blocks` DUY NHAT (Entry.contentBlocks)
// - moi instance TU LOC ra dung block cua zone minh (theo `(b.zone ?? "top")`)
// de sap xep/them/xoa, roi GHEP LAI vao mang day du khi goi onChange, tranh
// dam len block cua 2 zone kia. Sap xep bang nut len/xuong (giong pattern
// `moveAction` trong SeriesCardConfigForm.tsx) THAY VI dnd-kit - danh sach o
// day thuong chi vai phan tu. Xem SeriesEntryContentBlocks.tsx cho phan
// RENDER cong khai tuong ung.
export function EntryContentBlocksEditor({
  blocks,
  onChange,
  zone,
  allowToc = false,
}: {
  blocks: EntryContentBlock[];
  onChange: (blocks: EntryContentBlock[]) => void;
  zone: EntryContentBlockZone;
  // [2026-09-15] CHI entry "map" moi duoc phep dung block "toc" - yeu cau
  // nguoi dung: "Chỉ trang Map mới cho phép và có cái cục box TOC dạng
  // khung như này thôi nhé. Còn đâu không cho." CHI co y nghia voi
  // zone="top" (4 loai moi khong bao gio co "toc"). An lua chon "toc" khoi
  // menu "Thêm khối" khi false - xem loc lai luc RENDER cong khai trong
  // SeriesEntryContentBlocks.tsx (lop bao dam THAT su).
  allowToc?: boolean;
}) {
  const [addOpen, setAddOpen] = useState(false);
  const zoneBlocks = blocks.filter((b) => (b.zone ?? "top") === zone);
  const addableTypes = ZONE_TYPES[zone].filter((type) => type !== "toc" || allowToc);

  function updateZoneBlocks(nextZoneBlocks: EntryContentBlock[]) {
    onChange([...blocks.filter((b) => (b.zone ?? "top") !== zone), ...nextZoneBlocks]);
  }

  function addBlock(type: EntryContentBlock["type"]) {
    updateZoneBlocks([...zoneBlocks, newBlock(type, zone)]);
    setAddOpen(false);
  }

  function updateBlock(index: number, patch: Partial<EntryContentBlock>) {
    const next = [...zoneBlocks];
    next[index] = { ...next[index], ...patch } as EntryContentBlock;
    updateZoneBlocks(next);
  }

  function removeBlock(index: number) {
    updateZoneBlocks(zoneBlocks.filter((_, i) => i !== index));
  }

  function moveBlock(index: number, direction: -1 | 1) {
    const target = index + direction;
    if (target < 0 || target >= zoneBlocks.length) return;
    const next = [...zoneBlocks];
    [next[index], next[target]] = [next[target], next[index]];
    updateZoneBlocks(next);
  }

  return (
    <div className="flex flex-col gap-3">
      {zoneBlocks.map((block, index) => (
        <div key={block.id} className="rounded-lg border border-border p-3">
          <div className="mb-2 flex items-center justify-between gap-2">
            <span className="text-[13px] font-semibold text-ink">
              {BLOCK_TYPE_LABEL[block.type]}
            </span>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => moveBlock(index, -1)}
                disabled={index === 0}
                aria-label="Đưa lên"
                className="flex size-6 cursor-pointer items-center justify-center rounded-md text-ink-faint hover:bg-hover-bg hover:text-ink disabled:cursor-not-allowed disabled:opacity-30"
              >
                <ArrowUp size={13} />
              </button>
              <button
                type="button"
                onClick={() => moveBlock(index, 1)}
                disabled={index === zoneBlocks.length - 1}
                aria-label="Đưa xuống"
                className="flex size-6 cursor-pointer items-center justify-center rounded-md text-ink-faint hover:bg-hover-bg hover:text-ink disabled:cursor-not-allowed disabled:opacity-30"
              >
                <ArrowDown size={13} />
              </button>
              <button
                type="button"
                onClick={() => removeBlock(index)}
                aria-label="Xoá khối"
                className="flex size-6 cursor-pointer items-center justify-center rounded-md text-ink-faint hover:bg-hover-bg hover:text-danger"
              >
                <Trash2 size={13} />
              </button>
            </div>
          </div>

          {block.type === "toc" && (
            <p className="text-[12px] text-ink-faint">
              Tự quét các heading H2 trong nội dung, không cần cấu hình gì thêm.
              {!allowToc && (
                <span className="text-danger">
                  {" "}
                  Khối này chỉ hiển thị công khai trên entry &quot;map&quot; - entry hiện tại sẽ không hiện.
                </span>
              )}
            </p>
          )}

          {block.type === "install" && (
            <div className="flex flex-col gap-2">
              <input
                className={`${inputClass} font-mono`}
                placeholder="Command (vd: npx skills@latest add ...)"
                value={block.command}
                onChange={(e) => updateBlock(index, { command: e.target.value })}
              />
              <input
                className={inputClass}
                placeholder="Mô tả sau lệnh (tuỳ chọn, vd: Then type /wizard...)"
                value={block.description ?? ""}
                onChange={(e) => updateBlock(index, { description: e.target.value })}
              />
              <ButtonListEditor
                buttons={block.buttons ?? []}
                onChange={(buttons) => updateBlock(index, { buttons })}
              />
            </div>
          )}

          {block.type === "buttonGroup" && (
            <ButtonListEditor
              buttons={block.buttons}
              onChange={(buttons) => updateBlock(index, { buttons })}
            />
          )}

          {block.type === "callout" && (
            <div className="flex flex-col gap-2">
              <input
                className={inputClass}
                placeholder="Eyebrow (tuỳ chọn, vd: AI Skills for Real Engineers)"
                value={block.eyebrow ?? ""}
                onChange={(e) => updateBlock(index, { eyebrow: e.target.value })}
              />
              <input
                className={inputClass}
                placeholder="Tiêu đề *"
                value={block.title}
                onChange={(e) => updateBlock(index, { title: e.target.value })}
              />
              <textarea
                className={`${inputClass} min-h-16 resize-y`}
                placeholder="Mô tả (tuỳ chọn)"
                value={block.description ?? ""}
                onChange={(e) => updateBlock(index, { description: e.target.value })}
              />
            </div>
          )}

          {block.type === "newsletter" && (
            <p className="text-[12px] text-ink-faint">
              Không cần cấu hình - tự hiện form đăng ký email dùng chung tiêu đề/mô tả của Series
              (tab &quot;Thông tin chung&quot;), chỉ khi Series đã bật &quot;Email course&quot;.
            </p>
          )}

          {block.type === "botHelp" && (
            <div className="flex flex-col gap-2">
              <input
                className={inputClass}
                placeholder="Tiêu đề * (vd: Not sure where to start?)"
                value={block.title}
                onChange={(e) => updateBlock(index, { title: e.target.value })}
              />
              <textarea
                className={`${inputClass} min-h-16 resize-y`}
                placeholder="Mô tả *"
                value={block.description}
                onChange={(e) => updateBlock(index, { description: e.target.value })}
              />
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                <input
                  className={inputClass}
                  placeholder="Nhãn nút *"
                  value={block.buttonLabel}
                  onChange={(e) => updateBlock(index, { buttonLabel: e.target.value })}
                />
                <input
                  className={inputClass}
                  placeholder="URL nút *"
                  value={block.buttonUrl}
                  onChange={(e) => updateBlock(index, { buttonUrl: e.target.value })}
                />
              </div>
            </div>
          )}

          {block.type === "featurePromo" && (
            <div className="flex flex-col gap-2">
              <input
                className={inputClass}
                placeholder="URL ảnh *"
                value={block.imageUrl}
                onChange={(e) => updateBlock(index, { imageUrl: e.target.value })}
              />
              <input
                className={inputClass}
                placeholder="Eyebrow (tuỳ chọn, vd: AI HERO · SKILL SYSTEM)"
                value={block.eyebrow ?? ""}
                onChange={(e) => updateBlock(index, { eyebrow: e.target.value })}
              />
              <input
                className={inputClass}
                placeholder="Tiêu đề *"
                value={block.title}
                onChange={(e) => updateBlock(index, { title: e.target.value })}
              />
              <textarea
                className={`${inputClass} min-h-14 resize-y`}
                placeholder="Mô tả (tuỳ chọn)"
                value={block.description ?? ""}
                onChange={(e) => updateBlock(index, { description: e.target.value })}
              />
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                <input
                  className={inputClass}
                  placeholder="Nhãn nút *"
                  value={block.buttonLabel}
                  onChange={(e) => updateBlock(index, { buttonLabel: e.target.value })}
                />
                <input
                  className={inputClass}
                  placeholder="URL nút *"
                  value={block.buttonUrl}
                  onChange={(e) => updateBlock(index, { buttonUrl: e.target.value })}
                />
              </div>
            </div>
          )}

          {block.type === "deeperCourse" && (
            <div className="flex flex-col gap-2">
              <input
                className={inputClass}
                placeholder="Eyebrow (tuỳ chọn, vd: READY TO GO DEEPER?)"
                value={block.eyebrow ?? ""}
                onChange={(e) => updateBlock(index, { eyebrow: e.target.value })}
              />
              <input
                className={inputClass}
                placeholder="Tiêu đề *"
                value={block.title}
                onChange={(e) => updateBlock(index, { title: e.target.value })}
              />
              <textarea
                className={`${inputClass} min-h-14 resize-y`}
                placeholder="Mô tả (tuỳ chọn)"
                value={block.description ?? ""}
                onChange={(e) => updateBlock(index, { description: e.target.value })}
              />
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                <input
                  className={inputClass}
                  placeholder="Nhãn nút *"
                  value={block.buttonLabel}
                  onChange={(e) => updateBlock(index, { buttonLabel: e.target.value })}
                />
                <input
                  className={inputClass}
                  placeholder="URL nút *"
                  value={block.buttonUrl}
                  onChange={(e) => updateBlock(index, { buttonUrl: e.target.value })}
                />
              </div>
            </div>
          )}
        </div>
      ))}

      <PopoverRoot open={addOpen} onOpenChange={setAddOpen}>
        <PopoverTrigger asChild>
          <button
            type="button"
            className="flex cursor-pointer items-center gap-1.5 self-start rounded-md px-2 py-1.5 text-[13px] font-medium text-primary hover:bg-primary-soft"
          >
            <Plus size={14} /> Thêm section
            <ChevronDown size={13} className={addOpen ? "rotate-180" : ""} />
          </button>
        </PopoverTrigger>
        <PopoverContent
          open={addOpen}
          align="start"
          sideOffset={6}
          className="series-scope z-50 w-64 overflow-hidden rounded-md border border-border bg-surface shadow-dropdown"
        >
          <div className="p-1">
            {addableTypes.map((type) => (
              <button
                key={type}
                type="button"
                onClick={() => addBlock(type)}
                className="flex w-full cursor-pointer items-center rounded-md px-2.5 py-2 text-left text-[13px] text-ink-muted transition-colors duration-150 ease-out hover:bg-hover-bg hover:text-ink"
              >
                {BLOCK_TYPE_LABEL[type]}
              </button>
            ))}
          </div>
        </PopoverContent>
      </PopoverRoot>
    </div>
  );
}

function ButtonListEditor({
  buttons,
  onChange,
}: {
  buttons: EntryBlockButton[];
  onChange: (buttons: EntryBlockButton[]) => void;
}) {
  return (
    <RepeaterField
      items={buttons}
      onChange={onChange}
      newItem={newButton}
      addLabel="Thêm nút"
      renderRow={(item, update, remove) => (
        <div className="flex flex-col gap-2">
          <div className="flex items-start gap-2">
            <div className="grid min-w-0 flex-1 grid-cols-1 gap-2 sm:grid-cols-2">
              <input
                className={inputClass}
                placeholder="Label"
                value={item.label}
                onChange={(e) => update({ label: e.target.value })}
              />
              <input
                className={inputClass}
                placeholder="URL"
                value={item.url}
                onChange={(e) => update({ url: e.target.value })}
              />
            </div>
            <RemoveRowButton onClick={remove} />
          </div>
          <div className="flex items-center gap-3">
            <div className="min-w-0 flex-1">
              <SelectMenu
                value={item.style}
                onChange={(style) => update({ style })}
                options={BUTTON_STYLE_OPTIONS}
                placeholder="Kiểu nút"
              />
            </div>
            <label className="flex shrink-0 items-center gap-1.5 text-[12.5px] text-ink-muted">
              <input
                type="checkbox"
                checked={item.openInNewTab ?? false}
                onChange={(e) => update({ openInNewTab: e.target.checked })}
              />
              Mở tab mới
            </label>
          </div>
        </div>
      )}
    />
  );
}
