"use client";

import { useState } from "react";
import { NodeViewWrapper, type ReactNodeViewProps } from "@tiptap/react";
import { Link2, Plus, Search, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { PopoverRoot, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { RepeaterField, RemoveRowButton } from "@/components/series/RepeaterField";
import { BlockActionsMenu } from "./BlockActionsMenu";
import { PostLinkPickerModal } from "./PostLinkPickerModal";
import { CARD_PALETTES, resolveCardPalette, type CardPalette } from "./card-palettes";
import {
  CARD_GRID_STATUS_COLORS,
  cardGridStatusColor,
  normalizeCardGridItem,
  type CardGridItem,
  type CardGridKeyInfoItem,
  type CardGridStatus,
} from "./post-extensions";

// Gan 7 token cua 1 palette thanh CSS custom properties (style object) - cac
// class card-grid-item-* (POST_PROSE_CLASS) doc lai qua var(--card-accent-*),
// xem comment day du o card-palettes.ts. Giu rieng o day (khong o
// card-palettes.ts) de file do khong phu thuoc kieu React.CSSProperties -
// dung CHUNG duoc cho ca nhanh render chuoi HTML (post-extensions.ts).
function paletteStyle(palette: CardPalette): React.CSSProperties {
  return {
    "--card-accent": palette.accent,
    "--card-accent-strong": palette.accentStrong,
    "--card-accent-soft": palette.accentSoft,
    "--card-accent-light": palette.accentLight,
    "--card-accent-border": palette.accentBorder,
    "--card-accent-text": palette.accentText,
    "--card-accent-glow": palette.accentGlow,
  } as React.CSSProperties;
}

// "Card appearance" - popover chon 1 PALETTE (khong phai tung mau rieng le) -
// yeu cau nguoi dung: "không cho user chọn từng màu riêng lẻ. Hãy cho chọn
// một Color Theme / Palette" + "Đừng bắt user phải chọn màu cho tất cả card"
// (co san lua chon Auto - xem resolveCardPalette() o card-palettes.ts cho
// logic xoay vong theo vi tri, KHONG ngau nhien). Trigger la 1 cham tron +
// ten palette (hover moi hien ten day du, giong UX de xuat cua nguoi dung).
function PalettePicker({
  paletteId,
  resolved,
  onChange,
}: {
  paletteId: string | null;
  resolved: CardPalette;
  onChange: (paletteId: string | null) => void;
}) {
  const [open, setOpen] = useState(false);
  return (
    <PopoverRoot open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          title={`Màu thẻ: ${paletteId ? resolved.name : `Auto (${resolved.name})`}`}
          className="flex shrink-0 cursor-pointer items-center gap-1.5 rounded-full border border-border bg-surface px-2 py-1 text-[11px] font-medium text-ink-muted transition-transform duration-150 ease-out hover:scale-[1.03] hover:text-ink"
        >
          <span className="size-3 shrink-0 rounded-full ring-1 ring-black/10" style={{ backgroundColor: resolved.accent }} />
          {paletteId ? resolved.name : "Auto"}
        </button>
      </PopoverTrigger>
      <PopoverContent open={open} align="start" sideOffset={6} className="z-50 w-64 rounded-lg border border-border bg-surface p-2.5 shadow-dropdown">
        <label className="mb-1 block text-[11px] font-medium text-ink-faint">Card appearance</label>
        <button
          type="button"
          onClick={() => {
            onChange(null);
            setOpen(false);
          }}
          className={cn(
            "mb-2 flex w-full cursor-pointer items-center gap-2 rounded-md border px-2 py-1.5 text-left text-[12.5px] font-medium",
            paletteId === null ? "border-primary text-ink" : "border-border text-ink-muted hover:bg-hover-bg hover:text-ink",
          )}
        >
          <span className="flex size-4 shrink-0 items-center justify-center rounded-full border border-dashed border-ink-faint text-[9px]">
            A
          </span>
          Auto (tự xoay vòng theo thứ tự thẻ)
        </button>
        <div className="grid grid-cols-5 gap-1.5">
          {CARD_PALETTES.map((p) => (
            <button
              key={p.id}
              type="button"
              title={p.name}
              onClick={() => {
                onChange(p.id);
                setOpen(false);
              }}
              className={cn(
                "flex size-8 shrink-0 cursor-pointer items-center justify-center rounded-full transition-transform duration-150 ease-out hover:scale-110",
                paletteId === p.id
                  ? "ring-2 ring-primary ring-offset-2 ring-offset-surface"
                  : "ring-1 ring-black/10 ring-offset-2 ring-offset-surface",
              )}
              style={{ backgroundColor: p.accent }}
            />
          ))}
        </div>
      </PopoverContent>
    </PopoverRoot>
  );
}

// linkLabel mac dinh "Tìm hiểu thêm" - xem comment day du o DEFAULT_CARD_GRID_ITEMS
// (post-extensions.ts): chi dat mac dinh o CHO TAO MOI (day va insertCardGrid),
// khong dat trong normalizeCardGridItem() vi ham do con dung "vá" du lieu CU.
const EMPTY_ITEM: CardGridItem = normalizeCardGridItem({ linkLabel: "Tìm hiểu thêm" });

// Popover chon icon (van ban ngan, toi da ~2 ky tu - khong gioi han vao 1 bo
// icon Lucide co san, dung y "biến tấu theo nhiều mục đích" - nguoi dung co
// the go 1 ky tu/emoji bat ky). [2026-10-06] BO rieng o chon "màu nền" tu do -
// mau nen icon gio LUON theo accentStrong cua palette (Card Color System,
// xem PalettePicker/paletteStyle o tren) - yeu cau nguoi dung: "không cho
// user chọn từng màu riêng lẻ... một màu gốc tự động ràng buộc toàn bộ các
// element liên quan", tranh tinh trang icon/tag/border moi noi 1 mau rieng.
function IconPicker({ icon, iconColor, onChange }: { icon: string; iconColor: string; onChange: (patch: Partial<CardGridItem>) => void }) {
  const [open, setOpen] = useState(false);
  return (
    <PopoverRoot open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          title="Icon"
          className="flex size-13 shrink-0 cursor-pointer items-center justify-center rounded-lg text-[22px] font-bold text-white"
          style={{ backgroundColor: iconColor }}
        >
          {icon || "★"}
        </button>
      </PopoverTrigger>
      <PopoverContent open={open} align="start" sideOffset={6} className="z-50 w-56 rounded-lg border border-border bg-surface p-2.5 shadow-dropdown">
        <label className="mb-1 block text-[11px] font-medium text-ink-faint">Icon (1-2 ký tự/emoji)</label>
        <input
          value={icon}
          maxLength={2}
          onChange={(e) => onChange({ icon: e.target.value })}
          placeholder="★"
          className="w-full rounded-md border border-border bg-transparent px-2 py-1.5 text-center text-[14px] outline-none focus:border-primary"
        />
      </PopoverContent>
    </PopoverRoot>
  );
}

// Popover cham trang thai (goc trai) - yeu cau nguoi dung (redesign lan 2):
// "Small status / priority indicator in the top-left".
function StatusPicker({
  status,
  onChange,
  open,
  onOpenChange,
}: {
  status: CardGridStatus;
  onChange: (status: CardGridStatus) => void;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const dotColor = cardGridStatusColor(status);
  return (
    <PopoverRoot open={open} onOpenChange={onOpenChange}>
      <PopoverTrigger asChild>
        <button
          type="button"
          title="Chấm trạng thái"
          className="flex size-3.5 shrink-0 cursor-pointer items-center justify-center rounded-full ring-1 ring-border ring-offset-1 ring-offset-surface"
          style={dotColor ? { backgroundColor: dotColor } : undefined}
        >
          {!dotColor && <span className="size-full rounded-full border border-dashed border-ink-faint" />}
        </button>
      </PopoverTrigger>
      <PopoverContent open={open} align="start" sideOffset={6} className="z-50 flex w-40 flex-col gap-0.5 rounded-lg border border-border bg-surface p-1 shadow-dropdown">
        {CARD_GRID_STATUS_COLORS.map((s) => (
          <button
            key={s.id}
            type="button"
            onClick={() => {
              onChange(s.id);
              onOpenChange(false);
            }}
            className="flex w-full cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-left text-[12.5px] text-ink-muted hover:bg-hover-bg hover:text-ink"
          >
            {s.value ? (
              <span className="size-3 shrink-0 rounded-full" style={{ backgroundColor: s.value }} />
            ) : (
              <span className="size-3 shrink-0 rounded-full border border-dashed border-ink-faint" />
            )}
            {s.label}
          </button>
        ))}
      </PopoverContent>
    </PopoverRoot>
  );
}

const inputClass =
  "min-w-0 flex-1 rounded-md border border-transparent bg-transparent px-1.5 py-1 text-[13px] outline-none placeholder:text-ink-faint hover:border-border focus:border-primary";

// grid-template-columns dua theo BE RONG THAT cua chinh no (auto-fit/minmax),
// KHONG dung breakpoint theo VIEWPORT (sm:/lg:) - bug nguoi dung tung bao
// "Sao lại như này? Làm thì phải test chứ?" khi CardGrid bi long BEN TRONG 1
// khong gian hep hon nhieu (vd 1 o cua Grid khac) - man hinh du rong van ep
// du cot vao 1 vung qua hep neu dung breakpoint theo VIEWPORT. auto-fit tinh
// theo khong gian THAT co san cho chinh no, dung moi ngu canh.
const CARD_GRID_STYLE: React.CSSProperties = {
  gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
};

function newKeyInfoItem(): CardGridKeyInfoItem {
  return { label: "", value: "" };
}

// Rendered content cua 1 the (dung CHUNG cho ca 2 nhanh doc/soan ben duoi,
// khac nhau o "editable") - yeu cau nguoi dung (redesign lan 2, kem anh tham
// khao note.com-style knowledge card): the phai la 1 COMPONENT TAI SU DUNG
// duoc cho BAT KY dich vu/cong nghe/khai niem nao (khong rieng AWS) - 5 vung
// ro rang: Header (trang thai + icon tien ich + icon chinh + tieu de/phu de),
// Metadata (tags), Description, Key info (danh sach {label,value} tu do,
// ngan cach boi 1 duong ke), Footer (CTA + ghi chu phu).
function CardGridItemView({
  item,
  index,
  editable,
  onChange,
  onRemove,
  canRemove,
}: {
  item: CardGridItem;
  index: number;
  editable: boolean;
  onChange: (patch: Partial<CardGridItem>) => void;
  onRemove: () => void;
  canRemove: boolean;
}) {
  const [statusOpen, setStatusOpen] = useState(false);
  const [linkPickerOpen, setLinkPickerOpen] = useState(false);
  // Draft rieng cho o Tags (text tho nguoi dung dang go) - KHONG dung thang
  // item.tags.join(", ") lam value (bug cu: onChange split-trim-filter RONG
  // tags bi `.filter(Boolean)` bo di NGAY khi go dau "," cuoi cung, khien
  // value hien thi "nhay nguoc" ve khong co dau phay vua go - go lien tiep
  // "Compute," roi go tiep ten tag ke bi mat dau phay nen dinh lai thanh 1
  // tag). Tach draft (hien thi/go tu do) khoi tags THAT (chi parse khi commit).
  const [tagsDraft, setTagsDraft] = useState(() => item.tags.join(", "));
  const dotColor = cardGridStatusColor(item.status);
  const palette = resolveCardPalette(item.paletteId, index);
  const cssVars = paletteStyle(palette);
  const Wrapper = editable ? "div" : item.linkHref ? "a" : "div";

  if (!editable) {
    return (
      <Wrapper href={item.linkHref || undefined} className="card-grid-item" style={cssVars}>
        <div className="card-grid-item-glow" aria-hidden="true" />
        {(dotColor || item.utilityIcon) && (
          <div className="card-grid-item-topbar">
            {dotColor && <span className="card-grid-item-dot" style={{ backgroundColor: dotColor }} />}
            {item.utilityIcon && <span className="card-grid-item-utility">{item.utilityIcon}</span>}
          </div>
        )}
        <div className="card-grid-item-head">
          <span className="card-grid-item-icon">{item.icon}</span>
          <div className="card-grid-item-headtext">
            <span className="card-grid-item-title">{item.title}</span>
            {item.subtitle && <span className="card-grid-item-subtitle">{item.subtitle}</span>}
          </div>
        </div>
        {item.tags.length > 0 && (
          <div className="card-grid-item-tags">
            {item.tags.map((t, i) => (
              <span key={i} className="card-grid-item-tag">
                {t}
              </span>
            ))}
          </div>
        )}
        {item.description && <p className="card-grid-item-desc">{item.description}</p>}
        {item.keyInfo.length > 0 && (
          <>
            <div className="card-grid-item-divider" />
            <div className="card-grid-item-keyinfo">
              {item.keyInfo.map((k, i) => (
                <div key={i} className="card-grid-item-keyinfo-row">
                  <span className="card-grid-item-keyinfo-label">{k.label}</span>
                  <span className="card-grid-item-keyinfo-value">{k.value}</span>
                </div>
              ))}
            </div>
          </>
        )}
        {/* [2026-09-20 fix] TRUOC DAY an luon ca hang footer khi linkLabel
            rong (khop dung "spec" ban dau: CTA la optional) - nguoi dung
            KHONG tu dien Nhãn CTA cho tung the (hau het the deu de trong),
            dan toi KHONG THE nao thay duoc CTA/hover animation moi lam, du da
            fix dung: "Đâu? Có đéo đâu?... Ảnh thì tao gửi rồi". Doi sang LUON
            hien hang CTA (fallback "Tìm hiểu thêm" khi chua tu dat ten) -
            nguoi dung van sua/doi lai duoc Nhãn CTA binh thuong qua o nhap o
            duoi (luc editable), chi khac la KHONG CON the "an trang" mac
            dinh nua. */}
        <div className="card-grid-item-footer">
          <span className="card-grid-item-link">
            <span className="card-grid-item-link-label">{item.linkLabel || "Tìm hiểu thêm"}</span>
            <span className="card-grid-item-link-arrow">→</span>
          </span>
          {item.footerNote && <span className="card-grid-item-footnote">{item.footerNote}</span>}
        </div>
      </Wrapper>
    );
  }

  return (
    <div className="group card-grid-item relative flex flex-col" style={cssVars}>
      <div className="card-grid-item-glow" aria-hidden="true" />
      {canRemove && (
        <button
          type="button"
          onClick={onRemove}
          aria-label="Xoá card này"
          className="absolute top-2 right-2 z-10 flex size-5 shrink-0 cursor-pointer items-center justify-center rounded-full border border-border bg-surface text-ink-faint opacity-0 hover:bg-hover-bg hover:text-ink group-hover:opacity-100"
        >
          <X size={11} strokeWidth={2} />
        </button>
      )}

      {/* Header: trang thai + "Card appearance" (palette) ben trai, icon tien
          ich ben phai - group trai boc trong 1 flex rieng (thay vi de
          justify-between tu dan deu 3 phan tu) de StatusPicker/PalettePicker
          dung sat nhau, giu dung bo cuc 2 dau cu. */}
      <div className="card-grid-item-topbar">
        <div className="flex min-w-0 items-center gap-1.5">
          <StatusPicker status={item.status} onChange={(status) => onChange({ status })} open={statusOpen} onOpenChange={setStatusOpen} />
          <PalettePicker paletteId={item.paletteId} resolved={palette} onChange={(paletteId) => onChange({ paletteId })} />
        </div>
        <input
          value={item.utilityIcon}
          onChange={(e) => onChange({ utilityIcon: e.target.value })}
          maxLength={2}
          placeholder="—"
          title="Icon tiện ích (không bắt buộc, vd: 🔖 ★ ℹ ↗)"
          className="w-8 rounded-md border border-transparent bg-transparent text-center text-[13px] outline-none placeholder:text-ink-faint hover:border-border focus:border-primary"
        />
      </div>

      <div className="card-grid-item-head">
        <IconPicker icon={item.icon} iconColor={palette.accentStrong} onChange={onChange} />
        <div className="min-w-0 flex-1">
          <input
            value={item.title}
            onChange={(e) => onChange({ title: e.target.value })}
            placeholder="Tên dịch vụ / công nghệ / khái niệm..."
            className={inputClass + " block w-full text-[17px] font-bold"}
          />
          <input
            value={item.subtitle}
            onChange={(e) => onChange({ subtitle: e.target.value })}
            placeholder="Phụ đề / danh mục (không bắt buộc)..."
            className={inputClass + " mt-0.5 block w-full text-[12.5px]"}
          />
        </div>
      </div>

      {/* Metadata: tags - go cach nhau boi dau phay, tach thanh mang LUC BLUR
          (khong parse tren tung ky tu nua - xem comment tagsDraft o tren) */}
      <input
        value={tagsDraft}
        onChange={(e) => setTagsDraft(e.target.value)}
        onBlur={() =>
          onChange({
            tags: tagsDraft
              .split(",")
              .map((t) => t.trim())
              .filter(Boolean),
          })
        }
        placeholder="Tags, cách nhau bởi dấu phẩy (vd: Compute, Core, AWS)"
        className="mt-3 w-full rounded-md border border-transparent bg-transparent px-1.5 py-1 text-[12px] text-ink-muted outline-none placeholder:text-ink-faint hover:border-border focus:border-primary"
      />

      <textarea
        value={item.description}
        onChange={(e) => onChange({ description: e.target.value })}
        placeholder="Mô tả ngắn gọn..."
        rows={3}
        className="mt-2 w-full resize-none rounded-md border border-transparent bg-transparent px-1.5 py-1 text-[13.5px] text-ink-muted outline-none placeholder:text-ink-faint hover:border-border focus:border-primary"
      />

      {/* Key info - danh sach {label,value} tu do, dung RepeaterField chung
          voi form Series (khong rieng AWS: vd "Key benefit"/"Difficulty"/
          "Status"/"Related topic"...). */}
      <div className="mt-2 border-t border-border pt-2.5">
        <p className="mb-1.5 text-[11px] font-medium text-ink-faint uppercase">Thông tin thêm (không bắt buộc)</p>
        <RepeaterField
          items={item.keyInfo}
          onChange={(keyInfo) => onChange({ keyInfo })}
          newItem={newKeyInfoItem}
          addLabel="Thêm dòng thông tin"
          renderRow={(row, update, remove) => (
            <div className="flex items-center gap-1.5">
              <input
                value={row.label}
                onChange={(e) => update({ label: e.target.value })}
                placeholder="Nhãn (vd: Difficulty)"
                className={inputClass + " text-[12.5px] font-medium"}
              />
              <input
                value={row.value}
                onChange={(e) => update({ value: e.target.value })}
                placeholder="Giá trị"
                className={inputClass + " text-[12.5px]"}
              />
              <RemoveRowButton onClick={remove} />
            </div>
          )}
        />
      </div>

      {/* Footer: CTA + ghi chu phu */}
      <div className="mt-2 flex items-center gap-1.5 border-t border-border pt-2.5">
        <input
          value={item.linkLabel}
          onChange={(e) => onChange({ linkLabel: e.target.value })}
          placeholder="Nhãn CTA (vd: Xem thêm)"
          className={inputClass + " text-[13px] font-semibold text-primary"}
        />
        <input
          value={item.footerNote}
          onChange={(e) => onChange({ footerNote: e.target.value })}
          placeholder="Ghi chú phụ (không bắt buộc)"
          className={inputClass + " text-[11.5px] text-ink-faint"}
        />
      </div>
      {/* URL dich cho CTA - yeu cau nguoi dung: "muốn set link nó đến thì
          làm như nào ?". O nay VON DA CO TU truoc, nhung qua "chim" (border
          trong suot, chu mau nhat) nen de bi bo qua khong nhan ra - them icon
          Link2 + border luon hien (giong cac o khac trong the) cho de thay
          hon, khong doi hanh vi (van chi la 1 URL text thuong, khong validate). */}
      <div className="mt-1 flex items-center gap-1.5 rounded-md border border-border px-1.5 py-1">
        <Link2 size={12} strokeWidth={2} className="shrink-0 text-ink-faint" aria-hidden="true" />
        <input
          value={item.linkHref}
          onChange={(e) => onChange({ linkHref: e.target.value })}
          placeholder="URL đích khi bấm vào thẻ (vd: https://...)"
          className="min-w-0 flex-1 bg-transparent text-[11.5px] text-ink outline-none placeholder:text-ink-faint"
        />
        {/* "Tìm bài viết" - yeu cau nguoi dung: "Có làm thêm được cái search
            bài viết, đỡ phải nhập URL không ?" - thay vi tu go/dan URL, tim
            va chon 1 bai THAT trong he thong, tu dien URL dung dang "/p/<id>"
            (xem PostLinkPickerModal.tsx). Van giu duoc o nhap URL thuong ben
            canh cho truong hop can link ngoai (khong phai bai trong he thong). */}
        <button
          type="button"
          onClick={() => setLinkPickerOpen(true)}
          title="Tìm bài viết để liên kết"
          className="flex shrink-0 cursor-pointer items-center gap-1 rounded px-1.5 py-0.5 text-[11px] font-medium text-ink-faint hover:bg-hover-bg hover:text-ink"
        >
          <Search size={11} strokeWidth={2} aria-hidden="true" />
          Tìm bài
        </button>
      </div>
      <PostLinkPickerModal
        open={linkPickerOpen}
        onOpenChange={setLinkPickerOpen}
        onSelect={(url) => onChange({ linkHref: url })}
      />
    </div>
  );
}

// NodeView cua CardGrid - "the dich vu/kien thuc" tai su dung duoc cho BAT
// KY linh vuc nao (yeu cau nguoi dung redesign lan 2 - xem post-extensions.ts
// ve ly do chon huong ATOM). NodeViewWrapper contentEditable=false TRON VEN
// (khac Grid/GridCell can NodeViewContent that de ProseMirror theo doi
// children thuc su - CardGrid khong co children nao ca, moi du lieu la attrs
// `items[]`).
export function CardGridView({ node, updateAttributes, editor, getPos }: ReactNodeViewProps) {
  const items = ((node.attrs.items ?? []) as Partial<CardGridItem>[]).map(normalizeCardGridItem);
  const canEdit = editor.isEditable;

  function updateItem(i: number, patch: Partial<CardGridItem>) {
    updateAttributes({ items: items.map((it, idx) => (idx === i ? { ...it, ...patch } : it)) });
  }
  function addItem() {
    updateAttributes({ items: [...items, { ...EMPTY_ITEM }] });
  }
  function removeItem(i: number) {
    updateAttributes({ items: items.filter((_, idx) => idx !== i) });
  }

  return (
    <NodeViewWrapper contentEditable={false} className="card-grid-view group my-4">
      {/* Menu cho CA khoi CardGrid (tat ca card cung luc) - khac nut "x" rieng
          tren tung card (chi xoa 1 card, xem CardGridItemView). Dat trong 1
          hang RIENG (khong absolute) - tranh de len goc tren-phai cua chinh
          the DAU TIEN trong luoi (cham trang thai/icon tien ich cua no). */}
      {canEdit && (
        <div className="mb-1.5 flex justify-end">
          <BlockActionsMenu editor={editor} getPos={getPos} node={node} />
        </div>
      )}
      <div className="grid gap-3" style={CARD_GRID_STYLE}>
        {items.map((item, i) => (
          <CardGridItemView
            key={i}
            item={item}
            index={i}
            editable={canEdit}
            onChange={(patch) => updateItem(i, patch)}
            onRemove={() => removeItem(i)}
            canRemove={items.length > 1}
          />
        ))}
        {canEdit && (
          <button
            type="button"
            onClick={addItem}
            className="flex min-h-28 cursor-pointer items-center justify-center rounded-lg border border-dashed border-border text-ink-faint hover:border-ink-faint hover:text-ink"
          >
            <Plus size={18} strokeWidth={2} />
          </button>
        )}
      </div>
    </NodeViewWrapper>
  );
}
