"use client";

import { useState } from "react";
import { NodeViewWrapper, type ReactNodeViewProps } from "@tiptap/react";
import { Globe as GlobeIcon, Minus, Plus, X } from "lucide-react";
import { cn } from "@/lib/utils";
import type { StatAccordionItem, StatAccordionLegendItem } from "./post-extensions";
import { STAT_ACCORDION_DEFAULT_COLOR } from "./post-extensions";
import { RegionGlobeModal, type RegionGlobeTarget } from "./RegionGlobeModal";

// NodeView cua "Accordion thống kê" (bien the khac cua Accordion thuong -
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
  const count = (node.attrs.count as string) ?? "";
  const description = (node.attrs.description as string) ?? "";
  const open = node.attrs.open !== false;
  const items = (node.attrs.items ?? []) as StatAccordionItem[];
  const legend = (node.attrs.legend ?? []) as StatAccordionLegendItem[];
  const canEdit = editor.isEditable;
  // Test thu hieu ung globe NGAY trong editor (khong can luu/mo lai trang doc
  // that) - dung CHUNG 1 RegionGlobeModal voi ban doc cong khai
  // (EntryContentWithGlobe.tsx), chi khac nguon target la 1 dong item dang
  // sua thay vi click tu HTML tho.
  const [previewTarget, setPreviewTarget] = useState<RegionGlobeTarget | null>(null);
  // Noi dung LUON hien luc soan (khac ban render TINH tu dong an/hien theo
  // attr `open` khi doc that) - giong tinh than AccordionView.tsx, de van sua
  // duoc items/legend/description du dang dat mac dinh dong hay mo. Bam +/-
  // o day doi THANG attr `open` that (khac gia mockup chi la 1 nut xem
  // truoc) - vi day chinh la trang thai MAC DINH se ap dung luc doc that.

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
        {canEdit ? (
          <input
            value={count}
            onChange={(e) => updateAttributes({ count: e.target.value })}
            placeholder="Số lượng"
            className="w-16 shrink-0 rounded-md border border-border bg-surface-muted px-2 py-1 text-center text-[12.5px] font-semibold text-ink outline-none placeholder:text-ink-faint placeholder:font-normal"
          />
        ) : (
          count && (
            <span className="shrink-0 rounded-md bg-surface-muted px-2 py-1 text-[12.5px] font-semibold text-ink">
              {count}
            </span>
          )
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
              <div key={i} className="group flex items-center gap-2">
                <input
                  type="color"
                  value={item.color || STAT_ACCORDION_DEFAULT_COLOR}
                  onChange={(e) => updateItem(i, { color: e.target.value })}
                  disabled={!canEdit}
                  className="size-4 shrink-0 cursor-pointer rounded-full border-0 bg-transparent p-0 [&::-webkit-color-swatch]:rounded-full [&::-webkit-color-swatch]:border-none"
                  title="Màu chấm"
                />
                {canEdit ? (
                  <input
                    value={item.text}
                    onChange={(e) => updateItem(i, { text: e.target.value })}
                    placeholder="Nội dung..."
                    className="min-w-0 flex-1 bg-transparent text-[13.5px] text-ink outline-none placeholder:text-ink-faint"
                  />
                ) : (
                  <span className="min-w-0 flex-1 text-[13.5px] text-ink">{item.text}</span>
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
                        setPreviewTarget({ label: item.text, lat: item.lat as number, lng: item.lng as number })
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
              <div key={i} className="group flex items-center gap-2">
                <input
                  type="color"
                  value={l.color || STAT_ACCORDION_DEFAULT_COLOR}
                  onChange={(e) => updateLegend(i, { color: e.target.value })}
                  disabled={!canEdit}
                  className="size-4 shrink-0 cursor-pointer rounded-full border-0 bg-transparent p-0 [&::-webkit-color-swatch]:rounded-full [&::-webkit-color-swatch]:border-none"
                  title="Màu chấm"
                />
                {canEdit ? (
                  <input
                    value={l.label}
                    onChange={(e) => updateLegend(i, { label: e.target.value })}
                    placeholder="Chú thích cho màu này..."
                    className="min-w-0 flex-1 bg-transparent text-[12.5px] text-ink-faint outline-none placeholder:text-ink-faint"
                  />
                ) : (
                  <span className="min-w-0 flex-1 text-[12.5px] text-ink-faint">{l.label}</span>
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
      <RegionGlobeModal target={previewTarget} onOpenChange={(o) => !o && setPreviewTarget(null)} />
    </NodeViewWrapper>
  );
}
