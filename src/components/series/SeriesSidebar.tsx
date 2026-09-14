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
  return (
    <Link
      href={href}
      onClick={onNavigate}
      className={cn(
        "truncate rounded-lg py-1.5 pr-2 text-[13.5px] transition-colors duration-150 ease-out",
        active
          ? "bg-[rgba(20,22,26,0.06)] font-medium text-content-text"
          : "text-content-text hover:bg-hover-bg hover:text-[rgba(20,22,26,0.92)]",
      )}
      style={{ paddingLeft: `${18 + depth * 12}px` }}
    >
      {/* Active - DOI HAN sang chi 1 nen xam nhat trung tinh
          rgba(20,22,26,0.06), rounded-lg (yeu cau nguoi dung: "Thay đổi hẳn
          active... giờ chỉ để màu nền là rgba trên thôi") - BO HET accent
          #8F3F4D truoc do (ca nen tint mau lan thanh chi bao trai lan doi
          mau chu), khong con giu lai gi tu phien ban cu. */}
      {entry.icon && (
        <SeriesIconGlyph
          name={entry.icon}
          size={12}
          className="mr-1.5 inline align-[-1px]"
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

  const header = isAccordion ? (
    // font-mono - JetBrains Mono trong .series-scope (yeu cau nguoi dung,
    // xem app/layout.tsx/globals.css: --font-mono duoc doi rieng trong scope
    // nay) - ap cho ca nhan category GOC lan CON (ChevronRight/dau cham mau
    // giu nguyen, khong bi anh huong boi font-family).
    <button
      type="button"
      onClick={() => onToggle(category.id)}
      className="flex w-full cursor-pointer items-center gap-1.5 rounded-md px-2.5 py-1 font-mono text-[12px] font-semibold text-content-text hover:bg-hover-bg"
      style={{ paddingLeft: `${10 + depth * 12}px` }}
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
    // Category goc - nhan TINH (khong bam duoc), giu dung dang cu truoc khi
    // co accordion: chi to/mau khac entry, khong co chevron.
    <p
      className="flex items-center gap-1.5 px-2.5 font-mono text-[12px] font-normal text-content-text"
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
    <nav className="flex flex-col gap-6">
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
