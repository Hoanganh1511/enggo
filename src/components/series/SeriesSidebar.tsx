"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { SeriesIconGlyph } from "./series-icon-options";
import type {
  ContentSeriesCategory,
  ContentSeriesEntrySummary,
} from "@/lib/api/content-series";

// Nav trai cho 1 Series - dung cay TU danh sach PHANG (category + entry, ca
// 2 deu kem parentId/categoryId) thay vi server tra san cay long nhau, cung
// tinh than buildCommentTree (enggo) va DocsSidebar (component tham khao gan
// nhat trong repo cho "sidebar tai lieu nhieu bai", chi khac o day category
// ho tro NESTED qua parentId - dac ta muc 3 "Hỗ trợ nested category").
function buildCategoryTree(categories: ContentSeriesCategory[]) {
  const byParent = new Map<string | null, ContentSeriesCategory[]>();
  for (const cat of categories) {
    const list = byParent.get(cat.parentId) ?? [];
    list.push(cat);
    byParent.set(cat.parentId, list);
  }
  for (const list of byParent.values())
    list.sort((a, b) => a.orderIndex - b.orderIndex);
  return byParent;
}

function EntryLink({
  entry,
  seriesSlug,
  pathname,
  depth,
  onNavigate,
}: {
  entry: ContentSeriesEntrySummary;
  seriesSlug: string;
  pathname: string;
  depth: number;
  onNavigate?: () => void;
}) {
  const href = `/series/${seriesSlug}/${entry.slug}`;
  const active = pathname === href;
  // Entry THANG duoi category goc (depth 0) = "--sidebar-item" (14px, anchor
  // cua he token). Entry long trong 1 nhom con/accordion (depth 1) =
  // "--sidebar-subitem" (13px) - CHI 1 BAC nho hon, khong dung font-size de
  // "leo thang" hierarchy them nua (triet ly nguoi dung chot: "14px is the
  // anchor. Everything else is differentiation around 14px"). Active dung
  // CHUNG 1 mau/weight ("--sidebar-item-active", #27292D/500) o CA 2 cap -
  // chi DOI MAU/WEIGHT, KHONG doi kich thuoc chu luc active (giu dung
  // font-size goc cua cap do).
  const isNested = depth > 0;
  return (
    <Link
      href={href}
      onClick={onNavigate}
      className={cn(
        "truncate rounded-lg py-1.5 pr-2 leading-5 transition-colors duration-150 ease-out",
        isNested ? "text-[13px]" : "text-[14px]",
        active
          ? "bg-[rgba(20,22,26,0.06)] font-medium text-(--sidebar-item-active-color)"
          : cn(
              "hover:bg-hover-bg",
              isNested
                ? "font-normal text-(--sidebar-subitem-color)"
                : "font-normal text-(--sidebar-item-color)",
            ),
      )}
      // Entry THANG duoi category goc (depth 0) - paddingLeft CO DINH bang
      // DUNG category cha (10px, xem CategoryNode) - yeu cau nguoi dung:
      // "Các bài ngay liền sau cate cũng không để thụt padding left cộng
      // thêm. Giữ giống tỉ lệ dóng xuống của cate" - khong con "18px" nhu
      // truoc (tung la 1 khoang thut nho co y, gio bo di de dong hang THANG
      // CANH). Entry long trong accordion (depth>0) VAN thut vao (24px) -
      // day la truong hop CAN phan biet cap, khac voi truong hop tren.
      style={{ paddingLeft: isNested ? "24px" : "10px" }}
    >
      {/* Active - nen xam nhat trung tinh rgba(20,22,26,0.06), rounded-lg
          (yeu cau nguoi dung: "Thay đổi hẳn active... giờ chỉ để màu nền là
          rgba trên thôi") CONG voi mau/weight tu he token
          --sidebar-item-active-color (yeu cau nguoi dung: "Đồng thời để font
          medium cho cái active"). */}
      {entry.icon && (
        <SeriesIconGlyph
          name={entry.icon}
          size={14}
          className="mr-1.5 inline align-[-2px] text-(--sidebar-icon-color)"
        />
      )}
      {entry.navTitle || entry.title}
    </Link>
  );
}

// CHU Y: chi CATEGORY CON (depth > 0, tuc co parentId - nguoi dung tao qua
// "+ Thêm nhóm con" trong trang Quan ly, xem SeriesTreeManager.tsx) moi la
// ACCORDION bam dong/mo duoc. Category GOC (depth 0) VAN la nhan tinh nhu
// truoc gio, entry ben duoi LUON hien het - sua lai sau khi hieu SAI y nguoi
// dung 1 lan ("không phải là biến cái cấp đầu thành accordion... sau cái
// cate đó, tôi có thể thêm bài viết thẳng HOẶC chọn tạo 1 accordion"): accordion
// la 1 LUA CHON THEM trong long 1 category goc, khong phai ban than category
// goc.
function CategoryNode({
  category,
  depth,
  byParent,
  entriesByCategory,
  seriesSlug,
  pathname,
  onNavigate,
  openIds,
  onToggle,
}: {
  category: ContentSeriesCategory;
  depth: number;
  byParent: Map<string | null, ContentSeriesCategory[]>;
  entriesByCategory: Map<string, ContentSeriesEntrySummary[]>;
  seriesSlug: string;
  pathname: string;
  onNavigate?: () => void;
  openIds: Set<string>;
  onToggle: (id: string) => void;
}) {
  const children = byParent.get(category.id) ?? [];
  const entries = entriesByCategory.get(category.id) ?? [];
  const isAccordion = depth > 0;
  const open = !isAccordion || openIds.has(category.id);
  // Nhom con (accordion) dang CHUA entry active ben trong - doi mau sang
  // "--sidebar-item-parent-active-color" (dam hon nhom con binh thuong)
  // GIU NGUYEN weight 400 (khong bold nhu chinh entry active) - dung tinh
  // than token "--sidebar-item-parent-active" nguoi dung chot (14px/400/
  // #303236), phan biet ro voi entry THAT su active (14/500/#27292D).
  const hasActiveEntry = entries.some(
    (e) => `/series/${seriesSlug}/${e.slug}` === pathname,
  );

  const header = isAccordion ? (
    // Nhom con gio la 1 NAV ITEM cap 14px (anchor), KHONG con la "section"
    // 12px nhu truoc - theo he token nguoi dung chot ("14px is the anchor.
    // Everything else is differentiation around 14px"): "Explore"/"Guides"
    // (category GOC, nhan tinh) moi la "section" 12px, con nhom con la 1
    // hang dieu huong that su nam CUNG cap voi cac entry 14px khac.
    <button
      type="button"
      onClick={() => onToggle(category.id)}
      className={cn(
        // text-[13px] - dong bo VOI CHINH cac entry no chua (yeu cau nguoi
        // dung sau khi xem anh chup: "cái title accordion để cùng font size
        // với mấy cái kia") - uu tien phan hoi truc tiep tren giao dien nay
        // hon token spec ly thuyet ban dau (14px), vi day la 1 accordion HEP
        // pham vi (chi 1 nhom con + 2 entry ben trong), dong bo font-size
        // VOI CHINH NOI DUNG no dang bao boc quan trong hon so khop tuyet
        // doi voi "anchor" 14px chung toan sidebar.
        "flex w-full cursor-pointer items-center gap-1.5 rounded-md px-2.5 py-1 text-[13px] leading-5 font-normal hover:bg-hover-bg",
        hasActiveEntry
          ? "text-(--sidebar-item-parent-active-color)"
          : "text-(--sidebar-item-color)",
      )}
      // paddingLeft CO DINH (khong nhan them depth * 12) - yeu cau nguoi
      // dung: "accordion không để thụt vào đâu nhé. Chỉ có các bài trong
      // accordion mới bắt đầu tăng padding left thôi" - ban than hang
      // accordion thang HANG voi category goc, chi ENTRY o BEN TRONG no moi
      // thut le (xem EntryLink, van nhan depth * 12 nhu cu).
      style={{ paddingLeft: "10px" }}
    >
      {category.colorHex && (
        <span
          className="inline-block size-2 shrink-0 rounded-full"
          style={{ backgroundColor: category.colorHex }}
          aria-hidden="true"
        />
      )}
      <span className="min-w-0 flex-1 truncate text-left">
        {category.title}
      </span>
      {/* Chevron doi ve CUOI hang (yeu cau nguoi dung, xem screenshot) - truoc
          do nam dau hang truoc dau cham mau/title. */}
      <ChevronRight
        size={12}
        strokeWidth={2.2}
        className={cn(
          "shrink-0 transition-transform duration-150 ease-out",
          open && "rotate-90",
        )}
        aria-hidden="true"
      />
    </button>
  ) : (
    // Category goc - nhan TINH (khong bam duoc, khong co chevron) - day la
    // "--sidebar-section" DUY NHAT trong toan bo sidebar (12px/500/
    // #5F6368, xem globals.css .series-scope) - CHI category GOC moi o muc
    // 12px, moi cap con lai (nhom con/entry) deu xoay quanh anchor 14px
    // (yeu cau nguoi dung ve he token, xem comment CategoryNode/EntryLink).
    <p
      className="flex items-center gap-1.5 px-2.5 font-mono text-[12px] leading-4 font-medium text-(--sidebar-section-color)"
      style={{ paddingLeft: `${10 + depth * 12}px` }}
    >
      {category.colorHex && (
        <span
          className="inline-block size-2 shrink-0 rounded-full"
          style={{ backgroundColor: category.colorHex }}
          aria-hidden="true"
        />
      )}
      {category.title}
    </p>
  );

  return (
    <div>
      {header}

      {open && (entries.length > 0 || children.length > 0) && (
        <div
          className={cn("flex flex-col gap-0.5", isAccordion ? "mt-1" : "mt-2")}
        >
          {entries.map((entry) => (
            <EntryLink
              key={entry.id}
              entry={entry}
              seriesSlug={seriesSlug}
              pathname={pathname}
              depth={depth}
              onNavigate={onNavigate}
            />
          ))}
          {children.length > 0 && (
            <div
              className={cn(
                "flex flex-col gap-1",
                entries.length > 0 && "mt-2",
              )}
            >
              {children.map((child) => (
                <CategoryNode
                  key={child.id}
                  category={child}
                  depth={depth + 1}
                  byParent={byParent}
                  entriesByCategory={entriesByCategory}
                  seriesSlug={seriesSlug}
                  pathname={pathname}
                  onNavigate={onNavigate}
                  openIds={openIds}
                  onToggle={onToggle}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export function SeriesSidebar({
  seriesSlug,
  categories,
  entries,
  onNavigate,
}: {
  seriesSlug: string;
  categories: ContentSeriesCategory[];
  entries: ContentSeriesEntrySummary[];
  onNavigate?: () => void;
}) {
  const pathname = usePathname();
  const byParent = buildCategoryTree(categories);
  const roots = byParent.get(null) ?? [];

  const entriesByCategory = new Map<string, ContentSeriesEntrySummary[]>();
  for (const entry of entries) {
    const list = entriesByCategory.get(entry.categoryId) ?? [];
    list.push(entry);
    entriesByCategory.set(entry.categoryId, list);
  }
  for (const list of entriesByCategory.values())
    list.sort((a, b) => a.orderIndex - b.orderIndex);

  // Category CON (accordion, depth>0) dang chua Entry active - tu mo san,
  // giu tinh than mockup nguoi dung gui (nhom chua trang dang xem moi bung
  // mo, con lai thu gon). Category GOC (depth 0) KHONG can trong danh sach
  // nay nua vi luon hien san (khong con la accordion).
  const activeCategoryId =
    entries.find((e) => `/series/${seriesSlug}/${e.slug}` === pathname)
      ?.categoryId ?? null;

  const [openIds, setOpenIds] = useState<Set<string>>(
    () => new Set(activeCategoryId ? [activeCategoryId] : []),
  );

  // Dieu huong sang Entry o category KHAC (pathname doi) - dam bao category
  // moi active LUON duoc mo, nhung KHONG dong lai cac category nguoi dung da
  // tu bam mo tay truoc do (cong don vao Set thay vi thay the). Goi setState
  // NGAY TRONG RENDER (khong qua useEffect) theo dung pattern "Adjusting
  // state when a prop changes" cua React - xem CreateCollectionModal.tsx
  // cung pattern nay.
  const [lastActiveCategoryId, setLastActiveCategoryId] =
    useState(activeCategoryId);
  if (activeCategoryId !== lastActiveCategoryId) {
    setLastActiveCategoryId(activeCategoryId);
    if (activeCategoryId && !openIds.has(activeCategoryId)) {
      setOpenIds(new Set(openIds).add(activeCategoryId));
    }
  }

  function toggle(id: string) {
    setOpenIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  return (
    <nav className="flex flex-col gap-[26px]">
      {roots.map((root) => (
        <CategoryNode
          key={root.id}
          category={root}
          depth={0}
          byParent={byParent}
          entriesByCategory={entriesByCategory}
          seriesSlug={seriesSlug}
          pathname={pathname}
          onNavigate={onNavigate}
          openIds={openIds}
          onToggle={toggle}
        />
      ))}
    </nav>
  );
}
