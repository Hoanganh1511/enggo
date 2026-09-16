"use client";

import { useState } from "react";
import { NodeViewWrapper, type ReactNodeViewProps } from "@tiptap/react";
import { Globe as GlobeIcon, Minus, Plus, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { PopoverRoot, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import type { StatAccordionItem, StatAccordionLegendItem } from "./post-extensions";
import { STAT_ACCORDION_DEFAULT_COLOR, STAT_ACCORDION_STATUS_COLORS } from "./post-extensions";
import { RegionGlobeModal, type RegionGlobePoint } from "./RegionGlobeModal";

// Nut chon mau dang CHAM TRON - mo popover 5 mau CO SAN (STAT_ACCORDION_STATUS_COLORS)
// thay vi input[type=color] tu do - yeu cau nguoi dung: "có thể tùy chọn 5
// loại màu cho 5 trạng thái phổ thông của 1 dạng mặt hàng" (ep vao 1 bang
// mau CO NGHIA thay vi rainbow tuy y, dong bo mau xuyen suot cac Accordion
// Geographical khac nhau). Dung chung cho ca dot cua item LAN legend.
function ColorStatusPicker({
  color,
  onChange,
  disabled,
  open,
  onOpenChange,
}: {
  color: string;
  onChange: (color: string) => void;
  disabled?: boolean;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  return (
    <PopoverRoot open={open} onOpenChange={onOpenChange}>
      <PopoverTrigger asChild>
        <button
          type="button"
          disabled={disabled}
          title="Chọn màu chấm"
          className="size-4 shrink-0 cursor-pointer rounded-full ring-1 ring-border ring-offset-1 ring-offset-surface disabled:cursor-not-allowed"
          style={{ backgroundColor: color || STAT_ACCORDION_DEFAULT_COLOR }}
        />
      </PopoverTrigger>
      <PopoverContent
        open={open}
        align="start"
        sideOffset={6}
        className="z-50 flex w-40 flex-col gap-0.5 rounded-lg border border-border bg-surface p-1 shadow-dropdown"
      >
        {STAT_ACCORDION_STATUS_COLORS.map((c) => (
          <button
            key={c.value}
            type="button"
            onClick={() => {
              onChange(c.value);
              onOpenChange(false);
            }}
            className="flex w-full cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-left text-[12.5px] text-ink-muted transition-colors duration-150 ease-out hover:bg-hover-bg hover:text-ink"
          >
            <span className="size-3 shrink-0 rounded-full ring-1 ring-border" style={{ backgroundColor: c.value }} />
            {c.label}
          </button>
        ))}
      </PopoverContent>
    </PopoverRoot>
  );
}

// NodeView cua "Accordion Geographical" (bien the khac cua Accordion thuong -
// yeu cau nguoi dung: "1 biến thể khác của accordion, nhưng có số lượng, có
// button + - để collapse, bên trong nó có thể có description hoặc không tùy,
// bên dưới là list dạng dot, có thể tùy chỉnh màu sắc của dot, và dưới cuối
// cùng là chú thích mục đích của dot màu đấy" - mau mockup: khoi "Geographic
// Regions"/"Edge Locations" trong bai AWS Global Infrastructure). Node la
// ATOM (khac Accordion co content THAT block+) - toan bo du lieu (items/
// legend) la ATTRS JSON, giong tinh than QuestionPicker/CuratedList (snapshot
// luc soan, khong phai ProseMirror children that) vi day la danh sach CO
// CAU TRUC (text + mau), khong phai noi dung tu do can rich text.
export function StatAccordionView({ node, updateAttributes, editor }: ReactNodeViewProps) {
  const title = (node.attrs.title as string) ?? "";
  const description = (node.attrs.description as string) ?? "";
  const open = node.attrs.open !== false;
  const items = (node.attrs.items ?? []) as StatAccordionItem[];
  const legend = (node.attrs.legend ?? []) as StatAccordionLegendItem[];
  const canEdit = editor.isEditable;
  // Test thu hieu ung globe NGAY trong editor (khong can luu/mo lai trang doc
  // that) - dung CHUNG 1 RegionGlobeModal voi ban doc cong khai
  // (EntryContentWithGlobe.tsx). `points` la TOAN BO cac dong dang co ca
  // lat/lng (khop y "hiển thị tất cả tọa độ" ap dung ca luc test trong
  // editor), `previewFocus` la dong vua bam nut globe.
  const [previewFocus, setPreviewFocus] = useState<RegionGlobePoint | null>(null);
  // Chi 1 popover chon mau duoc mo tai 1 thoi diem (du danh sach items/legend
  // co bao nhieu dong) - luu "kind + index" cua dong dang mo thay vi 1 state
  // rieng cho tung dong.
  const [openColorPicker, setOpenColorPicker] = useState<{ kind: "item" | "legend"; index: number } | null>(null);
  // [2026-09-16] Bam +/- AN/HIEN THAT phan than (description/items/legend)
  // NGAY trong editor (khac ban truoc - giu LUON hien, chi doi attrs `open`
  // ngam) - yeu cau nguoi dung: "ấn đóng mở mà không thay đổi vậy? Nó lại chỉ
  // thay đổi bên preview bên phải" (ban cu bam nut trong editor khong thay
  // gi, phai nhin Live preview moi thay). An toan de conditional-render han
  // (khong nhu AccordionView.tsx phai dung CSS "hidden" giu lai trong DOM) vi
  // day la ATOM node, khong co ProseMirror content that can theo doi ben
  // trong - muon sua description/items/legend thi bam +/- mo ra truoc.

  function updateItem(index: number, patch: Partial<StatAccordionItem>) {
    updateAttributes({ items: items.map((it, i) => (i === index ? { ...it, ...patch } : it)) });
  }
  function addItem() {
    updateAttributes({ items: [...items, { text: "", color: STAT_ACCORDION_DEFAULT_COLOR }] });
  }
  function removeItem(index: number) {
    updateAttributes({ items: items.filter((_, i) => i !== index) });
  }

  function updateLegend(index: number, patch: Partial<StatAccordionLegendItem>) {
    updateAttributes({ legend: legend.map((l, i) => (i === index ? { ...l, ...patch } : l)) });
  }
  function addLegend() {
    updateAttributes({ legend: [...legend, { color: STAT_ACCORDION_DEFAULT_COLOR, label: "" }] });
  }
  function removeLegend(index: number) {
    updateAttributes({ legend: legend.filter((_, i) => i !== index) });
  }

  return (
    <NodeViewWrapper
      contentEditable={false}
      className="stat-accordion-view my-4 overflow-hidden rounded-xl border border-border"
    >
      <div className="flex items-center gap-2.5 px-3.5 py-2.5">
        {canEdit ? (
          <input
            value={title}
            onChange={(e) => updateAttributes({ title: e.target.value })}
            placeholder="Tiêu đề..."
            className="min-w-0 flex-1 bg-transparent text-[14.5px] font-semibold text-ink outline-none placeholder:text-ink-faint"
          />
        ) : (
          <span className="min-w-0 flex-1 text-[14.5px] font-semibold text-ink">{title}</span>
        )}
        {/* So luong TU TINH tu items.length (khong con go tay) - yeu cau
            nguoi dung: "phần số lượng trong accordion geographic thì bạn tự
            cho ra theo đúng số lượng được add vào chứ" - go tay de sai/quen
            cap nhat khi them/bot dong. */}
        {items.length > 0 && (
          <span
            title="Tự tính theo số dòng bên dưới"
            className="shrink-0 rounded-md bg-surface-muted px-2 py-1 text-[12.5px] font-semibold text-ink"
          >
            {items.length}
          </span>
        )}
        <button
          type="button"
          onClick={() => updateAttributes({ open: !open })}
          title={open ? "Mặc định: đang mở khi đọc" : "Mặc định: đang đóng khi đọc"}
          className="flex size-7 shrink-0 cursor-pointer items-center justify-center rounded-md text-ink-faint hover:bg-hover-bg hover:text-ink"
        >
          {open ? <Minus size={14} strokeWidth={2} /> : <Plus size={14} strokeWidth={2} />}
        </button>
      </div>

      {open && (
      <div className="border-t border-border px-3.5 py-3">
        {canEdit ? (
          <textarea
            value={description}
            onChange={(e) => updateAttributes({ description: e.target.value })}
            placeholder="Mô tả (không bắt buộc)..."
            rows={2}
            className="mb-3 w-full resize-y bg-transparent text-[13.5px] text-ink-muted outline-none placeholder:text-ink-faint"
          />
        ) : (
          description && <p className="mb-3 text-[13.5px] text-ink-muted">{description}</p>
        )}

        <div className="flex flex-col gap-1">
          {items.map((item, i) => {
            const hasCoords = typeof item.lat === "number" && typeof item.lng === "number";
            return (
              // flex-wrap - man hinh hep (editor tren tablet/thu nho trinh
              // duyet) khong du cho ca color+text+lat+lng+globe+xoa tren 1
              // dong, cho phep cum lat/lng/globe/xoa TU XUONG DONG duoi text
              // thay vi bi ep vo bo cuc/tran ngang. Text input co min-w-32
              // rieng (khac cac input khac van min-w-0) de dung LAM DIEM WRAP
              // - neu khong, flex-1 se cu co lai vo han truoc khi wrap.
              <div key={i} className="group flex flex-wrap items-center gap-x-2 gap-y-1.5">
                <ColorStatusPicker
                  color={item.color || STAT_ACCORDION_DEFAULT_COLOR}
                  onChange={(color) => updateItem(i, { color })}
                  disabled={!canEdit}
                  open={openColorPicker?.kind === "item" && openColorPicker.index === i}
                  onOpenChange={(o) => setOpenColorPicker(o ? { kind: "item", index: i } : null)}
                />
                {canEdit ? (
                  <input
                    value={item.text}
                    onChange={(e) => updateItem(i, { text: e.target.value })}
                    placeholder="Nội dung..."
                    className="min-w-32 flex-1 bg-transparent text-[13.5px] text-ink outline-none placeholder:text-ink-faint"
                  />
                ) : (
                  <span className="min-w-32 flex-1 text-[13.5px] text-ink">{item.text}</span>
                )}
                {canEdit && (
                  <>
                    {/* Lat/lng - de trong = dong nay KHONG bam duoc luc doc
                        (xem statAccordionItemAttrs trong post-extensions.ts).
                        Toa do co the tra cuu nhanh tren Google Maps (bam chuot
                        phai vao 1 diem -> copy toa do). */}
                    <input
                      type="number"
                      step="any"
                      value={item.lat ?? ""}
                      onChange={(e) =>
                        updateItem(i, { lat: e.target.value === "" ? undefined : Number(e.target.value) })
                      }
                      placeholder="lat"
                      title="Vĩ độ (latitude)"
                      className="w-14 shrink-0 rounded-md border border-border bg-surface px-1.5 py-1 text-[11.5px] text-ink outline-none focus:border-primary placeholder:text-ink-faint"
                    />
                    <input
                      type="number"
                      step="any"
                      value={item.lng ?? ""}
                      onChange={(e) =>
                        updateItem(i, { lng: e.target.value === "" ? undefined : Number(e.target.value) })
                      }
                      placeholder="lng"
                      title="Kinh độ (longitude)"
                      className="w-14 shrink-0 rounded-md border border-border bg-surface px-1.5 py-1 text-[11.5px] text-ink outline-none focus:border-primary placeholder:text-ink-faint"
                    />
                    <button
                      type="button"
                      disabled={!hasCoords}
                      onClick={() =>
                        hasCoords &&
                        setPreviewFocus({ label: item.text, lat: item.lat as number, lng: item.lng as number })
                      }
                      title={hasCoords ? "Xem thử trên quả địa cầu" : "Nhập lat/lng để xem thử"}
                      className="flex size-6 shrink-0 cursor-pointer items-center justify-center rounded-md text-ink-faint hover:bg-hover-bg hover:text-ink disabled:cursor-not-allowed disabled:opacity-30"
                    >
                      <GlobeIcon size={13} strokeWidth={2} />
                    </button>
                  </>
                )}
                {canEdit && (
                  <button
                    type="button"
                    onClick={() => removeItem(i)}
                    aria-label="Bỏ dòng"
                    className="flex size-5 shrink-0 cursor-pointer items-center justify-center rounded-full text-ink-faint opacity-0 hover:bg-hover-bg hover:text-ink group-hover:opacity-100"
                  >
                    <X size={12} strokeWidth={2} />
                  </button>
                )}
              </div>
            );
          })}
        </div>
        {canEdit && (
          <button
            type="button"
            onClick={addItem}
            className="mt-2 flex cursor-pointer items-center gap-1.5 text-[12.5px] font-medium text-ink-faint hover:text-ink"
          >
            <Plus size={13} strokeWidth={2} />
            Thêm dòng
          </button>
        )}

        {(legend.length > 0 || canEdit) && (
          <div className={cn("mt-3 flex flex-col gap-1.5", (items.length > 0 || description) && "border-t border-border pt-3")}>
            {legend.map((l, i) => (
              <div key={i} className="group flex flex-wrap items-center gap-x-2 gap-y-1.5">
                <ColorStatusPicker
                  color={l.color || STAT_ACCORDION_DEFAULT_COLOR}
                  onChange={(color) => updateLegend(i, { color })}
                  disabled={!canEdit}
                  open={openColorPicker?.kind === "legend" && openColorPicker.index === i}
                  onOpenChange={(o) => setOpenColorPicker(o ? { kind: "legend", index: i } : null)}
                />
                {canEdit ? (
                  <input
                    value={l.label}
                    onChange={(e) => updateLegend(i, { label: e.target.value })}
                    placeholder="Chú thích cho màu này..."
                    className="min-w-32 flex-1 bg-transparent text-[12.5px] text-ink-faint outline-none placeholder:text-ink-faint"
                  />
                ) : (
                  <span className="min-w-32 flex-1 text-[12.5px] text-ink-faint">{l.label}</span>
                )}
                {canEdit && (
                  <button
                    type="button"
                    onClick={() => removeLegend(i)}
                    aria-label="Bỏ chú thích"
                    className="flex size-5 shrink-0 cursor-pointer items-center justify-center rounded-full text-ink-faint opacity-0 hover:bg-hover-bg hover:text-ink group-hover:opacity-100"
                  >
                    <X size={12} strokeWidth={2} />
                  </button>
                )}
              </div>
            ))}
            {canEdit && (
              <button
                type="button"
                onClick={addLegend}
                className="flex cursor-pointer items-center gap-1.5 text-[12.5px] font-medium text-ink-faint hover:text-ink"
              >
                <Plus size={13} strokeWidth={2} />
                Thêm chú thích màu
              </button>
            )}
          </div>
        )}
      </div>
      )}
      <RegionGlobeModal
        focus={previewFocus}
        points={items
          .filter((it): it is StatAccordionItem & { lat: number; lng: number } => typeof it.lat === "number" && typeof it.lng === "number")
          .map((it) => ({ label: it.text, lat: it.lat, lng: it.lng }))}
        onOpenChange={(o) => !o && setPreviewFocus(null)}
      />
    </NodeViewWrapper>
  );
}
