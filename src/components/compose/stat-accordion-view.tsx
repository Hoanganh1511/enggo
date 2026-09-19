"use client";

import { useState } from "react";
import { NodeViewWrapper, type ReactNodeViewProps } from "@tiptap/react";
import { Globe as GlobeIcon, Grip, Minus, Plus, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { PopoverRoot, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import type { StatAccordionItem, StatAccordionLegendItem, StatAccordionStatus } from "./post-extensions";
import { STAT_ACCORDION_DEFAULT_COLOR, STAT_ACCORDION_STATUSES, statAccordionStatusColor } from "./post-extensions";
import { RegionGlobeModal, type RegionGlobePoint } from "./RegionGlobeModal";

// Popover 5 mau CO SAN (STAT_ACCORDION_STATUSES) danh cho LEGEND - legend van
// la 1 cap "mau tuy y + nhan tuy chinh" DOC LAP voi status cua item (khac
// item, xem StatusPicker duoi - legend KHONG bat buoc phai trung nghia voi 1
// status co san, admin co the dat nhan rieng cho cung 1 mau).
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
        {STAT_ACCORDION_STATUSES.map((c) => (
          <button
            key={c.id}
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

// Popover chon TRANG THAI (khong phai mau tu do) cho 1 item - yeu cau nguoi
// dung (dot mau): mau dot la GIA TRI SUY RA tu status, khong con luu hex
// doc lap tren tung dong. Swatch hien mau TUONG UNG voi status dang chon
// (statAccordionStatusColor), chon 1 muc = ghi `status.id` (khong phai hex)
// vao item.status.
function ItemStatusPicker({
  status,
  onChange,
  disabled,
  open,
  onOpenChange,
}: {
  status: StatAccordionStatus | undefined;
  onChange: (status: StatAccordionStatus) => void;
  disabled?: boolean;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const dotColor = statAccordionStatusColor(status);
  return (
    <PopoverRoot open={open} onOpenChange={onOpenChange}>
      <PopoverTrigger asChild>
        <button
          type="button"
          disabled={disabled}
          title={dotColor ? "Chọn trạng thái" : "Chọn trạng thái (đang: không hiện chấm màu)"}
          // status="none" - vien net dut (KHONG to mau) de phan biet ro voi
          // "co mau nhung mau la den" - yeu cau nguoi dung: "Cho phép config
          // có chấm tròn màu hoặc không".
          className={cn(
            "size-4 shrink-0 cursor-pointer rounded-full ring-offset-1 ring-offset-surface disabled:cursor-not-allowed",
            dotColor ? "ring-1 ring-border" : "border border-dashed border-ink-faint",
          )}
          style={dotColor ? { backgroundColor: dotColor } : undefined}
        />
      </PopoverTrigger>
      <PopoverContent
        open={open}
        align="start"
        sideOffset={6}
        className="z-50 flex w-44 flex-col gap-0.5 rounded-lg border border-border bg-surface p-1 shadow-dropdown"
      >
        {STAT_ACCORDION_STATUSES.map((s) => (
          <button
            key={s.id}
            type="button"
            onClick={() => {
              onChange(s.id);
              onOpenChange(false);
            }}
            className="flex w-full cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-left text-[12.5px] text-ink-muted transition-colors duration-150 ease-out hover:bg-hover-bg hover:text-ink"
          >
            {s.id === "none" ? (
              <span className="size-3 shrink-0 rounded-full border border-dashed border-ink-faint" />
            ) : (
              <span className="size-3 shrink-0 rounded-full ring-1 ring-border" style={{ backgroundColor: s.value }} />
            )}
            {s.label}
          </button>
        ))}
      </PopoverContent>
    </PopoverRoot>
  );
}

// Nut menu "9 chấm dạng lưới" (nen trong suot) - yeu cau nguoi dung: "Thêm 1
// button icon nền trong suốt, chỉ có icon kiểu 9 dots grid, khi click vào sẽ
// hiện popover 2 options: Duplicate..., Delete...". Thay THANG cho nut "x"
// go rieng truoc do (Delete gio la 1 trong 2 muc cua popover nay).
function ItemMenuButton({
  open,
  onOpenChange,
  onDuplicate,
  onDelete,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDuplicate: () => void;
  onDelete: () => void;
}) {
  return (
    <PopoverRoot open={open} onOpenChange={onOpenChange}>
      <PopoverTrigger asChild>
        <button
          type="button"
          aria-label="Tuỳ chọn dòng"
          className="flex size-5 shrink-0 cursor-pointer items-center justify-center rounded-md bg-transparent text-ink-faint opacity-0 hover:bg-hover-bg hover:text-ink group-hover:opacity-100"
        >
          <Grip size={13} strokeWidth={2} />
        </button>
      </PopoverTrigger>
      <PopoverContent
        open={open}
        align="end"
        sideOffset={6}
        className="z-50 flex w-36 flex-col gap-0.5 rounded-lg border border-border bg-surface p-1 shadow-dropdown"
      >
        <button
          type="button"
          onClick={() => {
            onDuplicate();
            onOpenChange(false);
          }}
          className="flex w-full cursor-pointer items-center rounded-md px-2 py-1.5 text-left text-[12.5px] text-ink-muted transition-colors duration-150 ease-out hover:bg-hover-bg hover:text-ink"
        >
          Nhân bản
        </button>
        <button
          type="button"
          onClick={() => {
            onDelete();
            onOpenChange(false);
          }}
          className="flex w-full cursor-pointer items-center rounded-md px-2 py-1.5 text-left text-[12.5px] text-danger transition-colors duration-150 ease-out hover:bg-danger/10"
        >
          Xoá
        </button>
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
// CAU TRUC, khong phai noi dung tu do can rich text.
//
// [2026-09-16] Item cau truc lai theo dung 3 tang AWS Global Infrastructure -
// yeu cau nguoi dung: "đừng lưu đơn thuần [text/color/lat/lng phẳng]... vì UI
// của bạn thực chất có 3 tầng: Geographic Area → AWS Region → Availability
// Zones" (xem dinh nghia StatAccordionItem trong post-extensions.ts).
export function StatAccordionView({ node, updateAttributes, editor }: ReactNodeViewProps) {
  const title = (node.attrs.title as string) ?? "";
  const description = (node.attrs.description as string) ?? "";
  const open = node.attrs.open !== false;
  const items = (node.attrs.items ?? []) as StatAccordionItem[];
  const legend = (node.attrs.legend ?? []) as StatAccordionLegendItem[];
  const canEdit = editor.isEditable;
  // Test thu hieu ung globe NGAY trong editor (khong can luu/mo lai trang doc
  // that) - dung CHUNG 1 RegionGlobeModal voi ban doc cong khai
  // (EntryContentWithGlobe.tsx). `points` la TOAN BO cac dong dang co
  // coordinates (khop y "hiển thị tất cả tọa độ" ap dung ca luc test trong
  // editor), `previewFocus` la dong vua bam nut globe.
  const [previewFocus, setPreviewFocus] = useState<RegionGlobePoint | null>(null);
  // Chi 1 popover chon mau/trang thai duoc mo tai 1 thoi diem (du danh sach
  // items/legend co bao nhieu dong) - luu "kind + index" cua dong dang mo
  // thay vi 1 state rieng cho tung dong.
  const [openColorPicker, setOpenColorPicker] = useState<{ kind: "item" | "legend"; index: number } | null>(null);
  // Popover menu "9 chấm" (Nhân bản/Xoá) - chi 1 dong mo tai 1 thoi diem.
  const [openItemMenu, setOpenItemMenu] = useState<number | null>(null);
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
    updateAttributes({ items: [...items, { name: "", status: "normal" as StatAccordionStatus }] });
  }
  function removeItem(index: number) {
    updateAttributes({ items: items.filter((_, i) => i !== index) });
  }
  // Nhan ban - chen 1 BAN SAO cua dong `index` NGAY PHIA DUOI no (khong phai
  // cuoi danh sach) - yeu cau nguoi dung: "Duplicate (tạo bản sao của config
  // này ngay phía dưới nó)".
  function duplicateItem(index: number) {
    const next = [...items];
    next.splice(index + 1, 0, { ...items[index] });
    updateAttributes({ items: next });
  }
  // lat/lng la 2 O NHAP RIENG (UX quen thuoc) nhung luu chung vao 1
  // `coordinates` (yeu cau nguoi dung: nhom toa do lai thanh 1 khoi) - CHI
  // tao coordinates khi CA HAI gia tri deu la so hop le, con thieu 1 trong 2
  // thi coi nhu CHUA co toa do (undefined), tranh luu nua-vet toa do khong
  // dung.
  function updateItemCoordinate(index: number, key: "lat" | "lng", raw: string) {
    const current = items[index].coordinates;
    const value = raw === "" ? undefined : Number(raw);
    const nextLat = key === "lat" ? value : current?.lat;
    const nextLng = key === "lng" ? value : current?.lng;
    const coordinates =
      typeof nextLat === "number" && typeof nextLng === "number" ? { lat: nextLat, lng: nextLng } : undefined;
    updateItem(index, { coordinates });
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
            className="shrink-0 rounded-md bg-surface-muted px-2 py-1 text-[10.5px] font-semibold text-black/80"
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

        <div className="flex flex-col gap-1.5">
          {items.map((item, i) => {
            const hasCoords = Boolean(item.coordinates);
            return (
              // The rieng cho tung dong (thay vi 1 hang flex phang) - danh
              // sach truong da tang (name/geographicArea/code/lat/lng) khong
              // con vua 1 dong duy nhat. Hang 1 = trang thai + ten (thuong
              // dung nhat). Hang 2 (thut le theo hang 1) = khu vuc dia ly +
              // ma Region + toa do + nut globe - cac truong nay CHI co y
              // nghia cho danh sach kieu "AWS Region" (vd "Geographic
              // Regions"), KHONG bat buoc cho danh sach khac (vd "Edge
              // Locations" - khong phai Region/AZ) nen de trong duoc.
              // has-[input:focus]:scale (KHONG con focus-within:scale) - bug
              // nguoi dung bao "giờ phải click 2 lần mới mở lên chọn được. 1
              // lần như kiểu nó scale lên ý" tren nut ItemStatusPicker/
              // ColorStatusPicker (popover): ban truoc dung focus-within,
              // TU DONG kich hoat scale KHI CHINH nut mo popover nhan focus -
              // nut do vua la ANCHOR de Radix Popover do vi tri, vua bi chinh
              // hieu ung scale cua the cha lam DOI kich thuoc/vi tri ngay
              // GIUA luc popover dang mo (transition-transform 150ms), khien
              // lan do vi tri dau tien SAI/nam ngoai tam nhin - bam lai LAN 2
              // (luc do scale da on dinh, khong con doi giua chung) moi thay
              // popover dung cho. `has-[input:focus]` CHI kich hoat scale khi
              // 1 O NHAP VAN BAN THAT (input) dang focus (dung y ban dau
              // "đang tương tác con trỏ" = go chu) - KHONG con phan ung voi
              // nut popover/globe nhan focus nua, loai tru hoan toan xung dot
              // voi vi tri neo cua popover ben trong.
              <div
                key={i}
                className="group relative rounded-lg border border-border/60 bg-surface p-2 transition-transform duration-150 ease-out has-[input:focus]:z-10 has-[input:focus]:scale-[1.02] has-[input:focus]:border-border has-[input:focus]:shadow-sm"
              >
                <div className="flex items-center gap-2">
                  <ItemStatusPicker
                    status={item.status}
                    onChange={(status) => updateItem(i, { status })}
                    disabled={!canEdit}
                    open={openColorPicker?.kind === "item" && openColorPicker.index === i}
                    onOpenChange={(o) => setOpenColorPicker(o ? { kind: "item", index: i } : null)}
                  />
                  {canEdit ? (
                    <input
                      value={item.name}
                      onChange={(e) => updateItem(i, { name: e.target.value })}
                      placeholder="Tên (vd: South America (São Paulo))..."
                      className="min-w-0 flex-1 bg-transparent text-[13.5px] text-ink outline-none placeholder:text-ink-faint"
                    />
                  ) : (
                    <span className="min-w-0 flex-1 text-[13.5px] text-ink">{item.name}</span>
                  )}
                  {canEdit && (
                    <ItemMenuButton
                      open={openItemMenu === i}
                      onOpenChange={(o) => setOpenItemMenu(o ? i : null)}
                      onDuplicate={() => duplicateItem(i)}
                      onDelete={() => removeItem(i)}
                    />
                  )}
                </div>
                {canEdit && (
                  <div className="mt-1.5 flex flex-wrap items-center gap-1.5 pl-6">
                    <input
                      value={item.geographicArea ?? ""}
                      onChange={(e) => updateItem(i, { geographicArea: e.target.value || undefined })}
                      placeholder="Khu vực địa lý (vd: South America)"
                      className="min-w-36 flex-1 rounded-md border border-border bg-surface px-1.5 py-1 text-[11.5px] text-ink outline-none focus:border-primary placeholder:text-ink-faint"
                    />
                    <input
                      value={item.code ?? ""}
                      onChange={(e) => updateItem(i, { code: e.target.value || undefined })}
                      placeholder="Mã Region (vd: sa-east-1)"
                      className="w-32 shrink-0 rounded-md border border-border bg-surface px-1.5 py-1 font-mono text-[11.5px] text-ink outline-none focus:border-primary placeholder:text-ink-faint"
                    />
                    {/* Lat/lng - de trong = dong nay KHONG bam duoc luc doc
                        (xem statAccordionItemAttrs trong post-extensions.ts).
                        Toa do co the tra cuu nhanh tren Google Maps (bam chuot
                        phai vao 1 diem -> copy toa do). */}
                    <input
                      type="number"
                      step="any"
                      value={item.coordinates?.lat ?? ""}
                      onChange={(e) => updateItemCoordinate(i, "lat", e.target.value)}
                      placeholder="lat"
                      title="Vĩ độ (latitude)"
                      className="w-16 shrink-0 rounded-md border border-border bg-surface px-1.5 py-1 text-[11.5px] text-ink outline-none focus:border-primary placeholder:text-ink-faint"
                    />
                    <input
                      type="number"
                      step="any"
                      value={item.coordinates?.lng ?? ""}
                      onChange={(e) => updateItemCoordinate(i, "lng", e.target.value)}
                      placeholder="lng"
                      title="Kinh độ (longitude)"
                      className="w-16 shrink-0 rounded-md border border-border bg-surface px-1.5 py-1 text-[11.5px] text-ink outline-none focus:border-primary placeholder:text-ink-faint"
                    />
                    <button
                      type="button"
                      disabled={!hasCoords}
                      onClick={() =>
                        item.coordinates &&
                        setPreviewFocus({ label: item.name, lat: item.coordinates.lat, lng: item.coordinates.lng })
                      }
                      title={hasCoords ? "Xem thử trên quả địa cầu" : "Nhập lat/lng để xem thử"}
                      className="flex size-6 shrink-0 cursor-pointer items-center justify-center rounded-md text-ink-faint hover:bg-hover-bg hover:text-ink disabled:cursor-not-allowed disabled:opacity-30"
                    >
                      <GlobeIcon size={13} strokeWidth={2} />
                    </button>
                  </div>
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
          .filter((it): it is StatAccordionItem & { coordinates: { lat: number; lng: number } } => Boolean(it.coordinates))
          .map((it) => ({ label: it.name, lat: it.coordinates.lat, lng: it.coordinates.lng }))}
        onOpenChange={(o) => !o && setPreviewFocus(null)}
      />
    </NodeViewWrapper>
  );
}
