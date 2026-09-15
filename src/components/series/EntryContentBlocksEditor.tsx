"use client";

import { useState } from "react";
import { ArrowDown, ArrowUp, ChevronLeft, Plus, Trash2 } from "lucide-react";
import { SimpleModal } from "@/components/ui/simple-modal";
import { SelectMenu } from "@/components/ui/select-menu";
import { RepeaterField, RemoveRowButton } from "@/components/series/RepeaterField";
import { cn } from "@/lib/utils";
import type {
  EntryBlockButton,
  EntryBlockButtonStyle,
  EntryContentBlock,
  EntryContentBlockZone,
  EntryLessonListItem,
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
  lessonList: "Danh sách bài học",
};

// Mo ta ngan duoi nhan trong modal chon block - giup hinh dung THEM anh
// preview (yeu cau nguoi dung: "rõ ảnh mô tả demo từng loại đê biết bố cục
// nó như nào").
const BLOCK_TYPE_DESCRIPTION: Record<EntryContentBlock["type"], string> = {
  toc: "Lưới ô số + câu hỏi, tự quét heading H2",
  install: "Dòng lệnh copy-paste + nút bên dưới",
  buttonGroup: "1 hàng nhiều nút bấm",
  callout: "Băng màu nhấn mạnh, tràn full-width",
  newsletter: "Form đăng ký email của Series",
  botHelp: "Icon + gợi ý + 1 nút CTA",
  featurePromo: "Ảnh + tiêu đề + mô tả + nút",
  deeperCourse: "Tiêu đề + mô tả + nút, không ảnh",
  lessonList: "Tiêu đề chung + nhiều thẻ bài học xếp dọc",
};

// [2026-09-16] Zone "top" (duoi subtitle) DA BO khoi form soan - yeu cau
// nguoi dung: "Xóa cái Top Đầu Bài đi". Chi con 2 vi tri chen duoc qua UI
// nay: "middle" (truoc than bai) va "bottom" (sau than bai) - CA 2 dung
// CHUNG 1 bo 5 loai block (newsletter/botHelp/featurePromo/deeperCourse/
// lessonList), khac voi 4 loai CU rieng cho "top" (toc/install/buttonGroup/
// callout - van con hop le o TANG DU LIEU/render cong khai cho entry cu da
// co san blocks zone="top" tu truoc, chi khong con tao MOI duoc qua form nay
// nua). "toc" dac biet: KHONG nam trong danh sach nay vi von chi thuoc zone
// "top" (tu dong hien rieng cho entry "map" khi zoneBlocks rong, xem
// SeriesEntryContentBlocks.tsx - khong can admin tao thu cong).
const EDITABLE_ZONES: { id: "middle" | "bottom"; label: string; description: string }[] = [
  {
    id: "middle",
    label: "Giữa bài",
    description: "Hiện ngay trên đường kẻ ngang, trước khi vào nội dung chính.",
  },
  {
    id: "bottom",
    label: "Cuối bài",
    description: "Hiện sau nội dung chính, trước khi sang bài tiếp theo.",
  },
];

const ADDABLE_TYPES: EntryContentBlock["type"][] = [
  "newsletter",
  "botHelp",
  "featurePromo",
  "deeperCourse",
  "lessonList",
];

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

// [2026-09-16] Zone tham so gio CHI con "middle" | "bottom" (khop dung
// EDITABLE_ZONES/pendingZone - "top" da bo khoi form soan, xem comment dau
// file) - cac case toc/install/buttonGroup/callout van giu (type cua chung
// nhan zone rong hon: "top"|"middle"|"bottom") de switch van EXHAUSTIVE du
// khong con duong nao trong UI moi tao duoc chung nua.
function newBlock(type: EntryContentBlock["type"], zone: "middle" | "bottom"): EntryContentBlock {
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
      return { id: randomId(), zone, type: "newsletter" };
    case "botHelp":
      return {
        id: randomId(),
        zone,
        type: "botHelp",
        title: "",
        description: "",
        buttonLabel: "",
        buttonUrl: "",
      };
    case "featurePromo":
      return {
        id: randomId(),
        zone,
        type: "featurePromo",
        imageUrl: "",
        title: "",
        buttonLabel: "",
        buttonUrl: "",
      };
    case "deeperCourse":
      return {
        id: randomId(),
        zone,
        type: "deeperCourse",
        title: "",
        buttonLabel: "",
        buttonUrl: "",
      };
    case "lessonList":
      return { id: randomId(), zone, type: "lessonList", items: [] };
  }
}

function newButton(): EntryBlockButton {
  return { id: randomId(), label: "", url: "", style: "outline-black" };
}

function newLessonItem(): EntryLessonListItem {
  return { id: randomId(), imageUrl: "", title: "", url: "" };
}

// Editor cho danh sach "khoi noi dung" CHEN duoc vao vi tri "giữa" hoặc
// "cuối" 1 trang Entry - dung 1 LAN DUY NHAT trong SeriesEntryForm.tsx (KHAC
// truoc day dung 3 lan rieng cho top/middle/bottom, xem lich su duoi).
//
// [2026-09-16] Gop lai thanh 1 khoi DUY NHAT (khong con 3 "cục" rieng) - yeu
// cau nguoi dung: "Không tách thành 3 cục riêng này. Xóa cái Top Đầu Bài đi.
// Giờ để 1 button click, sau đó nó hiện modal ra chọn 1 trong 2 cái. Rồi
// chọn mẫu, vậy cho gọn". Danh sach block cua CA 2 zone hien THEO NHOM (chi
// hien nhom nao dang co block, tranh tieu de rong) trong CUNG 1 khung, 1 nut
// "+ Thêm section" DUY NHAT mo modal 2 BUOC: (1) chon vi tri (Giữa bài/Cuối
// bài), (2) chon mau (grid preview nhu cu). Sap xep len/xuong van tinh RIENG
// trong tung zone (2 zone hien o 2 vi tri khac nhau tren trang cong khai,
// tron thu tu giua chung khong co y nghia).
export function EntryContentBlocksEditor({
  blocks,
  onChange,
}: {
  blocks: EntryContentBlock[];
  onChange: (blocks: EntryContentBlock[]) => void;
}) {
  const [pickerStep, setPickerStep] = useState<"zone" | "type" | null>(null);
  const [pendingZone, setPendingZone] = useState<"middle" | "bottom" | null>(null);

  function blocksForZone(zoneId: EntryContentBlockZone) {
    return blocks.filter((b) => (b.zone ?? "top") === zoneId);
  }

  function updateZoneBlocks(zoneId: EntryContentBlockZone, nextZoneBlocks: EntryContentBlock[]) {
    onChange([...blocks.filter((b) => (b.zone ?? "top") !== zoneId), ...nextZoneBlocks]);
  }

  function addBlock(type: EntryContentBlock["type"]) {
    if (!pendingZone) return;
    updateZoneBlocks(pendingZone, [...blocksForZone(pendingZone), newBlock(type, pendingZone)]);
    closePicker();
  }

  function updateBlock(zoneId: EntryContentBlockZone, index: number, patch: Partial<EntryContentBlock>) {
    const list = blocksForZone(zoneId);
    const next = [...list];
    next[index] = { ...next[index], ...patch } as EntryContentBlock;
    updateZoneBlocks(zoneId, next);
  }

  function removeBlock(zoneId: EntryContentBlockZone, index: number) {
    updateZoneBlocks(zoneId, blocksForZone(zoneId).filter((_, i) => i !== index));
  }

  function moveBlock(zoneId: EntryContentBlockZone, index: number, direction: -1 | 1) {
    const list = blocksForZone(zoneId);
    const target = index + direction;
    if (target < 0 || target >= list.length) return;
    const next = [...list];
    [next[index], next[target]] = [next[target], next[index]];
    updateZoneBlocks(zoneId, next);
  }

  function openPicker() {
    setPendingZone(null);
    setPickerStep("zone");
  }

  function closePicker() {
    setPickerStep(null);
    setPendingZone(null);
  }

  const nonEmptyZones = EDITABLE_ZONES.filter((z) => blocksForZone(z.id).length > 0);

  return (
    <div className="rounded-xl border border-border p-4">
      <label className="mb-1 block text-[13px] font-medium text-ink">Section chèn thêm</label>
      <p className="-mt-0.5 mb-3 text-[12px] text-ink-faint">
        Chèn khối nội dung tuỳ chỉnh vào giữa bài (trước nội dung chính) hoặc cuối bài (trước bài tiếp theo).
      </p>

      {nonEmptyZones.length > 0 && (
        <div className="mb-3 flex flex-col gap-4">
          {nonEmptyZones.map((zoneConfig) => {
            const zoneBlocks = blocksForZone(zoneConfig.id);
            return (
              <div key={zoneConfig.id} className="flex flex-col gap-2">
                <p className="text-[11px] font-semibold tracking-wide text-ink-faint uppercase">
                  {zoneConfig.label}
                </p>
                {zoneBlocks.map((block, index) => (
                  <BlockCard
                    key={block.id}
                    block={block}
                    onUpdate={(patch) => updateBlock(zoneConfig.id, index, patch)}
                    onRemove={() => removeBlock(zoneConfig.id, index)}
                    onMoveUp={() => moveBlock(zoneConfig.id, index, -1)}
                    onMoveDown={() => moveBlock(zoneConfig.id, index, 1)}
                    canMoveUp={index > 0}
                    canMoveDown={index < zoneBlocks.length - 1}
                  />
                ))}
              </div>
            );
          })}
        </div>
      )}

      <button
        type="button"
        onClick={openPicker}
        className="flex cursor-pointer items-center gap-1.5 self-start rounded-md px-2 py-1.5 text-[13px] font-medium text-primary hover:bg-primary-soft"
      >
        <Plus size={14} /> Thêm section
      </button>

      <SimpleModal
        open={pickerStep !== null}
        onOpenChange={(open) => !open && closePicker()}
        title={pickerStep === "type" ? "Chọn mẫu" : "Chọn vị trí"}
        maxWidthClassName="max-w-xl"
      >
        {pickerStep === "zone" && (
          <div className="series-scope grid grid-cols-1 gap-3 sm:grid-cols-2">
            {EDITABLE_ZONES.map((zoneConfig) => (
              <button
                key={zoneConfig.id}
                type="button"
                onClick={() => {
                  setPendingZone(zoneConfig.id);
                  setPickerStep("type");
                }}
                className="flex cursor-pointer flex-col gap-1 rounded-lg border border-border p-3.5 text-left transition-colors duration-150 ease-out hover:border-primary hover:bg-primary-soft"
              >
                <p className="text-[13px] font-semibold text-ink">{zoneConfig.label}</p>
                <p className="text-[12px] text-ink-faint">{zoneConfig.description}</p>
              </button>
            ))}
          </div>
        )}

        {pickerStep === "type" && pendingZone && (
          <div className="series-scope flex flex-col gap-3">
            <button
              type="button"
              onClick={() => setPickerStep("zone")}
              className="flex w-fit cursor-pointer items-center gap-1 text-[12.5px] font-medium text-ink-faint hover:text-ink"
            >
              <ChevronLeft size={14} /> Quay lại
            </button>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {ADDABLE_TYPES.map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => addBlock(type)}
                  className="flex cursor-pointer flex-col overflow-hidden rounded-lg border border-border text-left transition-colors duration-150 ease-out hover:border-primary hover:bg-primary-soft"
                >
                  <BlockTypePreview type={type} />
                  <div className="p-2.5">
                    <p className="text-[12.5px] font-semibold text-ink">{BLOCK_TYPE_LABEL[type]}</p>
                    <p className="mt-0.5 text-[11px] text-ink-faint">{BLOCK_TYPE_DESCRIPTION[type]}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}
      </SimpleModal>
    </div>
  );
}

// The 1 block trong danh sach - tach rieng khoi component chinh de dung
// CHUNG cho ca 2 nhom "Giữa bài"/"Cuối bài" ma khong lap code (truoc day 1
// zone = 1 instance EntryContentBlocksEditor rieng nen khong can tach, gio 1
// instance duy nhat hien CA 2 nhom nen phai tach block-card ra rieng).
function BlockCard({
  block,
  onUpdate,
  onRemove,
  onMoveUp,
  onMoveDown,
  canMoveUp,
  canMoveDown,
}: {
  block: EntryContentBlock;
  onUpdate: (patch: Partial<EntryContentBlock>) => void;
  onRemove: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  canMoveUp: boolean;
  canMoveDown: boolean;
}) {
  return (
    <div className="rounded-lg border border-border p-3">
      <div className="mb-2 flex items-center justify-between gap-2">
        <span className="text-[13px] font-semibold text-ink">{BLOCK_TYPE_LABEL[block.type]}</span>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={onMoveUp}
            disabled={!canMoveUp}
            aria-label="Đưa lên"
            className="flex size-6 cursor-pointer items-center justify-center rounded-md text-ink-faint hover:bg-hover-bg hover:text-ink disabled:cursor-not-allowed disabled:opacity-30"
          >
            <ArrowUp size={13} />
          </button>
          <button
            type="button"
            onClick={onMoveDown}
            disabled={!canMoveDown}
            aria-label="Đưa xuống"
            className="flex size-6 cursor-pointer items-center justify-center rounded-md text-ink-faint hover:bg-hover-bg hover:text-ink disabled:cursor-not-allowed disabled:opacity-30"
          >
            <ArrowDown size={13} />
          </button>
          <button
            type="button"
            onClick={onRemove}
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
        </p>
      )}

      {block.type === "install" && (
        <div className="flex flex-col gap-2">
          <input
            className={`${inputClass} font-mono`}
            placeholder="Command (vd: npx skills@latest add ...)"
            value={block.command}
            onChange={(e) => onUpdate({ command: e.target.value })}
          />
          <input
            className={inputClass}
            placeholder="Mô tả sau lệnh (tuỳ chọn, vd: Then type /wizard...)"
            value={block.description ?? ""}
            onChange={(e) => onUpdate({ description: e.target.value })}
          />
          <ButtonListEditor
            buttons={block.buttons ?? []}
            onChange={(buttons) => onUpdate({ buttons })}
          />
        </div>
      )}

      {block.type === "buttonGroup" && (
        <ButtonListEditor buttons={block.buttons} onChange={(buttons) => onUpdate({ buttons })} />
      )}

      {block.type === "callout" && (
        <div className="flex flex-col gap-2">
          <input
            className={inputClass}
            placeholder="Eyebrow (tuỳ chọn, vd: AI Skills for Real Engineers)"
            value={block.eyebrow ?? ""}
            onChange={(e) => onUpdate({ eyebrow: e.target.value })}
          />
          <input
            className={inputClass}
            placeholder="Tiêu đề *"
            value={block.title}
            onChange={(e) => onUpdate({ title: e.target.value })}
          />
          <textarea
            className={`${inputClass} min-h-16 resize-y`}
            placeholder="Mô tả (tuỳ chọn)"
            value={block.description ?? ""}
            onChange={(e) => onUpdate({ description: e.target.value })}
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
            onChange={(e) => onUpdate({ title: e.target.value })}
          />
          <textarea
            className={`${inputClass} min-h-16 resize-y`}
            placeholder="Mô tả *"
            value={block.description}
            onChange={(e) => onUpdate({ description: e.target.value })}
          />
          <input
            className={inputClass}
            placeholder="Nhãn nút *"
            value={block.buttonLabel}
            onChange={(e) => onUpdate({ buttonLabel: e.target.value })}
          />
          <ButtonActionField
            url={block.buttonUrl}
            event={block.buttonEvent}
            onChangeUrl={(buttonUrl) => onUpdate({ buttonUrl })}
            onChangeEvent={(buttonEvent) => onUpdate({ buttonEvent })}
          />
        </div>
      )}

      {block.type === "featurePromo" && (
        <div className="flex flex-col gap-2">
          <input
            className={inputClass}
            placeholder="URL ảnh *"
            value={block.imageUrl}
            onChange={(e) => onUpdate({ imageUrl: e.target.value })}
          />
          <input
            className={inputClass}
            placeholder="Eyebrow (tuỳ chọn, vd: AI HERO · SKILL SYSTEM)"
            value={block.eyebrow ?? ""}
            onChange={(e) => onUpdate({ eyebrow: e.target.value })}
          />
          <input
            className={inputClass}
            placeholder="Tiêu đề *"
            value={block.title}
            onChange={(e) => onUpdate({ title: e.target.value })}
          />
          <textarea
            className={`${inputClass} min-h-14 resize-y`}
            placeholder="Mô tả (tuỳ chọn)"
            value={block.description ?? ""}
            onChange={(e) => onUpdate({ description: e.target.value })}
          />
          <input
            className={inputClass}
            placeholder="Nhãn nút *"
            value={block.buttonLabel}
            onChange={(e) => onUpdate({ buttonLabel: e.target.value })}
          />
          <ButtonActionField
            url={block.buttonUrl}
            event={block.buttonEvent}
            onChangeUrl={(buttonUrl) => onUpdate({ buttonUrl })}
            onChangeEvent={(buttonEvent) => onUpdate({ buttonEvent })}
          />
        </div>
      )}

      {block.type === "deeperCourse" && (
        <div className="flex flex-col gap-2">
          <input
            className={inputClass}
            placeholder="Eyebrow (tuỳ chọn, vd: READY TO GO DEEPER?)"
            value={block.eyebrow ?? ""}
            onChange={(e) => onUpdate({ eyebrow: e.target.value })}
          />
          <input
            className={inputClass}
            placeholder="Tiêu đề *"
            value={block.title}
            onChange={(e) => onUpdate({ title: e.target.value })}
          />
          <textarea
            className={`${inputClass} min-h-14 resize-y`}
            placeholder="Mô tả (tuỳ chọn)"
            value={block.description ?? ""}
            onChange={(e) => onUpdate({ description: e.target.value })}
          />
          <input
            className={inputClass}
            placeholder="Nhãn nút *"
            value={block.buttonLabel}
            onChange={(e) => onUpdate({ buttonLabel: e.target.value })}
          />
          <ButtonActionField
            url={block.buttonUrl}
            event={block.buttonEvent}
            onChangeUrl={(buttonUrl) => onUpdate({ buttonUrl })}
            onChangeEvent={(buttonEvent) => onUpdate({ buttonEvent })}
          />
        </div>
      )}

      {block.type === "lessonList" && (
        <div className="flex flex-col gap-2">
          <input
            className={inputClass}
            placeholder="Tiêu đề chung (tuỳ chọn, vd: 5 lessons, in order)"
            value={block.heading ?? ""}
            onChange={(e) => onUpdate({ heading: e.target.value })}
          />
          <LessonListItemsEditor items={block.items} onChange={(items) => onUpdate({ items })} />
        </div>
      )}
    </div>
  );
}

// Anh xem truoc dang "skeleton" TINH (khong shimmer - day la 1 the chon
// trong modal, khong phai trang thai dang tai that) mo phong DUNG bo cuc
// cong khai cua tung loai block (xem SeriesEntryContentBlocks.tsx) - giup
// admin hinh dung TRUOC KHI chon, thay vi doan qua ten chu.
function BlockTypePreview({ type }: { type: EntryContentBlock["type"] }) {
  const bar = "rounded-full bg-[rgba(20,22,26,0.14)]";
  return (
    <div className="flex h-20 items-center justify-center bg-surface-muted p-3">
      {type === "toc" && (
        <div className="grid w-full grid-cols-2 gap-1.5">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="flex items-center gap-1 rounded-sm border border-[rgba(20,22,26,0.14)] bg-surface px-1.5 py-1">
              <span className={`h-1.5 w-2 shrink-0 ${bar}`} />
              <span className={`h-1.5 flex-1 ${bar}`} />
            </div>
          ))}
        </div>
      )}
      {type === "install" && (
        <div className="flex w-full flex-col gap-1.5">
          <div className="h-5 w-full rounded-sm bg-[#0d1117]" />
          <span className={`h-1.5 w-1/2 ${bar}`} />
        </div>
      )}
      {type === "buttonGroup" && (
        <div className="flex w-full items-center gap-1.5">
          <span className="h-4 w-1/3 rounded-full bg-ink" />
          <span className="h-4 w-1/3 rounded-full border border-[rgba(20,22,26,0.25)]" />
          <span className={`h-4 w-1/3 rounded-full ${bar}`} />
        </div>
      )}
      {type === "callout" && (
        <div className="flex w-full flex-col gap-1.5 rounded-sm bg-[#e8e9ec] p-2">
          <span className={`h-1.5 w-1/3 ${bar}`} />
          <span className={`h-2 w-3/4 rounded-full bg-[rgba(20,22,26,0.28)]`} />
          <span className={`h-1.5 w-1/2 ${bar}`} />
        </div>
      )}
      {type === "newsletter" && (
        <div className="flex w-full flex-col gap-1.5">
          <span className={`h-1.5 w-2/3 ${bar}`} />
          <div className="flex gap-1">
            <span className="h-3.5 flex-1 rounded-sm border border-[rgba(20,22,26,0.18)] bg-surface" />
            <span className="h-3.5 flex-1 rounded-sm border border-[rgba(20,22,26,0.18)] bg-surface" />
            <span className="h-3.5 w-6 shrink-0 rounded-sm bg-accent-gold" />
          </div>
        </div>
      )}
      {type === "botHelp" && (
        <div className="flex w-full items-center gap-2">
          <span className="size-6 shrink-0 rounded-full bg-[rgba(20,22,26,0.18)]" />
          <div className="flex min-w-0 flex-1 flex-col gap-1">
            <span className={`h-1.5 w-4/5 ${bar}`} />
            <span className={`h-1.5 w-3/5 ${bar}`} />
          </div>
          <span className="h-4 w-8 shrink-0 rounded-sm bg-ink" />
        </div>
      )}
      {type === "featurePromo" && (
        <div className="flex w-full items-center gap-2">
          <span className="size-8 shrink-0 rounded-sm bg-[rgba(20,22,26,0.18)]" />
          <div className="flex min-w-0 flex-1 flex-col gap-1">
            <span className={`h-1.5 w-2/3 ${bar}`} />
            <span className={`h-1.5 w-1/2 ${bar}`} />
          </div>
          <span className="h-4 w-6 shrink-0 rounded-sm bg-primary" />
        </div>
      )}
      {type === "deeperCourse" && (
        <div className="flex w-full flex-col gap-1.5">
          <span className={`h-1.5 w-1/3 ${bar}`} />
          <span className={`h-2 w-3/4 rounded-full bg-[rgba(20,22,26,0.28)]`} />
          <span className="mt-0.5 h-4 w-10 rounded-sm bg-accent-gold" />
        </div>
      )}
      {type === "lessonList" && (
        <div className="flex w-full flex-col gap-1">
          {[0, 1, 2].map((i) => (
            <div key={i} className="flex items-center gap-1.5 rounded-sm border border-[rgba(20,22,26,0.14)] bg-surface p-1">
              <span className="h-4 w-6 shrink-0 rounded-sm bg-[rgba(20,22,26,0.18)]" />
              <span className={`h-1.5 flex-1 ${bar}`} />
              <span className="size-3 shrink-0 rounded-full border border-[rgba(20,22,26,0.25)]" />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// [2026-09-15] Chon giua "Link URL" (hanh vi CU, dieu huong) va "Sự kiện
// trang" (dispatch 1 CustomEvent tren window, KHONG dieu huong) - yeu cau
// nguoi dung: "ngoài gắn link url cho button ra, thì nếu như tôi muốn đặt
// cho nó event, sự kiện gì đó liên quan tới page thì sao?" (vd nut "Ask AI
// Assistant" trong botHelp can MO 1 widget/modal NGAY TRANG HIEN TAI, khong
// phai dieu huong sang URL nao). Dung CHUNG cho ca nut don le (botHelp/
// featurePromo/deeperCourse) LAN tung dong trong ButtonListEditor
// (buttonGroup/install) - xem EntryBlockButton.event trong content-series.ts
// ve cach hanh vi nay duoc RENDER cong khai.
function ButtonActionField({
  url,
  event,
  onChangeUrl,
  onChangeEvent,
}: {
  url: string;
  event?: string;
  onChangeUrl: (url: string) => void;
  onChangeEvent: (event: string | undefined) => void;
}) {
  const mode: "link" | "event" = event !== undefined ? "event" : "link";
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex w-fit gap-0.5 rounded-md bg-surface-muted p-0.5">
        <button
          type="button"
          onClick={() => onChangeEvent(undefined)}
          className={cn(
            "cursor-pointer rounded px-2 py-1 text-[11.5px] font-medium transition-colors duration-150 ease-out",
            mode === "link" ? "bg-surface text-ink shadow-sm" : "text-ink-faint hover:text-ink-muted",
          )}
        >
          Link URL
        </button>
        <button
          type="button"
          onClick={() => onChangeEvent(event ?? "")}
          className={cn(
            "cursor-pointer rounded px-2 py-1 text-[11.5px] font-medium transition-colors duration-150 ease-out",
            mode === "event" ? "bg-surface text-ink shadow-sm" : "text-ink-faint hover:text-ink-muted",
          )}
        >
          Sự kiện trang
        </button>
      </div>
      {mode === "link" ? (
        <input
          className={inputClass}
          placeholder="URL nút *"
          value={url}
          onChange={(e) => onChangeUrl(e.target.value)}
        />
      ) : (
        <>
          <input
            className={`${inputClass} font-mono`}
            placeholder="Tên sự kiện (vd: open-ai-assistant)"
            value={event ?? ""}
            onChange={(e) => onChangeEvent(e.target.value)}
          />
          <p className="text-[11px] text-ink-faint">
            Bấm nút sẽ phát <code className="font-mono">window.dispatchEvent(new CustomEvent(&quot;tên sự kiện&quot;))</code> thay
            vì điều hướng - cần có code khác trong app lắng nghe đúng tên này để xử lý (mở chat, cuộn trang...).
          </p>
        </>
      )}
    </div>
  );
}

// Danh sach bai hoc cho block "lessonList" (xem SeriesEntryContentBlocks.tsx
// - LessonListBlock). Moi dong: anh thu nho + tieu de + mo ta (tuy chon) +
// ButtonActionField dung chung (link URL hoac su kien trang) cho hanh dong
// khi bam vao the.
function LessonListItemsEditor({
  items,
  onChange,
}: {
  items: EntryLessonListItem[];
  onChange: (items: EntryLessonListItem[]) => void;
}) {
  return (
    <RepeaterField
      items={items}
      onChange={onChange}
      newItem={newLessonItem}
      addLabel="Thêm bài học"
      renderRow={(item, update, remove) => (
        <div className="flex flex-col gap-2">
          <div className="flex items-start gap-2">
            <input
              className={`${inputClass} min-w-0 flex-1`}
              placeholder="URL ảnh thu nhỏ *"
              value={item.imageUrl}
              onChange={(e) => update({ imageUrl: e.target.value })}
            />
            <RemoveRowButton onClick={remove} />
          </div>
          <input
            className={inputClass}
            placeholder="Tiêu đề *"
            value={item.title}
            onChange={(e) => update({ title: e.target.value })}
          />
          <input
            className={inputClass}
            placeholder="Mô tả (tuỳ chọn, 2 dòng)"
            value={item.description ?? ""}
            onChange={(e) => update({ description: e.target.value })}
          />
          <ButtonActionField
            url={item.url}
            event={item.event}
            onChangeUrl={(url) => update({ url })}
            onChangeEvent={(event) => update({ event })}
          />
        </div>
      )}
    />
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
            <input
              className={`${inputClass} min-w-0 flex-1`}
              placeholder="Label"
              value={item.label}
              onChange={(e) => update({ label: e.target.value })}
            />
            <RemoveRowButton onClick={remove} />
          </div>
          <ButtonActionField
            url={item.url}
            event={item.event}
            onChangeUrl={(url) => update({ url })}
            onChangeEvent={(event) => update({ event })}
          />
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
