"use client";

import { useState } from "react";
import { ArrowDown, ArrowUp, Plus, Trash2 } from "lucide-react";
import { SimpleModal } from "@/components/ui/simple-modal";
import { SelectMenu } from "@/components/ui/select-menu";
import { RepeaterField, RemoveRowButton } from "@/components/series/RepeaterField";
import { cn } from "@/lib/utils";
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
  const [pickerOpen, setPickerOpen] = useState(false);
  const zoneBlocks = blocks.filter((b) => (b.zone ?? "top") === zone);
  const addableTypes = ZONE_TYPES[zone].filter((type) => type !== "toc" || allowToc);

  function updateZoneBlocks(nextZoneBlocks: EntryContentBlock[]) {
    onChange([...blocks.filter((b) => (b.zone ?? "top") !== zone), ...nextZoneBlocks]);
  }

  function addBlock(type: EntryContentBlock["type"]) {
    updateZoneBlocks([...zoneBlocks, newBlock(type, zone)]);
    setPickerOpen(false);
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
              <input
                className={inputClass}
                placeholder="Nhãn nút *"
                value={block.buttonLabel}
                onChange={(e) => updateBlock(index, { buttonLabel: e.target.value })}
              />
              <ButtonActionField
                url={block.buttonUrl}
                event={block.buttonEvent}
                onChangeUrl={(buttonUrl) => updateBlock(index, { buttonUrl })}
                onChangeEvent={(buttonEvent) => updateBlock(index, { buttonEvent })}
              />
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
              <input
                className={inputClass}
                placeholder="Nhãn nút *"
                value={block.buttonLabel}
                onChange={(e) => updateBlock(index, { buttonLabel: e.target.value })}
              />
              <ButtonActionField
                url={block.buttonUrl}
                event={block.buttonEvent}
                onChangeUrl={(buttonUrl) => updateBlock(index, { buttonUrl })}
                onChangeEvent={(buttonEvent) => updateBlock(index, { buttonEvent })}
              />
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

      <button
        type="button"
        onClick={() => setPickerOpen(true)}
        className="flex cursor-pointer items-center gap-1.5 self-start rounded-md px-2 py-1.5 text-[13px] font-medium text-primary hover:bg-primary-soft"
      >
        <Plus size={14} /> Thêm section
      </button>

      {/* [2026-09-15] Modal grid 3 cot (khong con dropdown text) - yeu cau
          nguoi dung: "đừng dùng dropdown, hãy mở một modal, trình bày các
          options dạng grid 3 cột, rõ ảnh mô tả demo từng loại đê biết bố
          cục nó như nào, kiểu skeleton ấy, xong người dùng chọn thì hiện
          thông tin để điền". Moi the la 1 ban xem truoc "skeleton" TINH (bar
          xam mo phong bo cuc that, xem BlockTypePreview) - chon xong dong
          modal + goi addBlock nhu cu, block moi hien NGAY trong danh sach
          BEN TRONG editor (o tren) voi cac o nhap de dien, dung y "hiện
          thông tin để điền" nguoi dung mo ta. */}
      <SimpleModal
        open={pickerOpen}
        onOpenChange={setPickerOpen}
        title="Thêm section"
        maxWidthClassName="max-w-xl"
      >
        <div className="series-scope grid grid-cols-2 gap-3 sm:grid-cols-3">
          {addableTypes.map((type) => (
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
      </SimpleModal>
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
