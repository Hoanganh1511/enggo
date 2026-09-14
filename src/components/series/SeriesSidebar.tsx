"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
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
  const open = openIds.has(category.id);

  return (
    <div>
      {/* Category gio la 1 hang ACCORDION bam duoc (truoc day chi la nhan
          tinh, entry ben duoi LUON hien het) - yeu cau nguoi dung "thêm 1 cấp
          nữa" (tham khao 1 sidebar ngoai: chi category dang chua Entry active
          moi tu mo san, con lai thu gon). Chevron xoay 90deg khi mo (khong
          doi component rieng cho 2 huong). Van giu dung tong mau/size chu nhu
          truoc (--content-text, 12px font-semibold) - CHI them hanh vi
          bam+chevron, khong doi cam giac thi giac cap category. */}
      <button
        type="button"
        onClick={() => onToggle(category.id)}
        className="flex w-full cursor-pointer items-center gap-1.5 rounded-md px-2.5 py-1 text-[12px] font-semibold text-content-text hover:bg-hover-bg"
        style={{ paddingLeft: `${10 + depth * 12}px` }}
      >
        <ChevronRight
          size={12}
          strokeWidth={2.2}
          className={cn("shrink-0 transition-transform duration-150 ease-out", open && "rotate-90")}
          aria-hidden="true"
        />
        {category.colorHex && (
          <span
            className="inline-block size-2 shrink-0 rounded-full"
            style={{ backgroundColor: category.colorHex }}
            aria-hidden="true"
          />
        )}
        <span className="min-w-0 flex-1 truncate text-left">{category.title}</span>
      </button>

      {open && (
        <div className="mt-1 flex flex-col gap-0.5">
          {entries.map((entry) => {
            const href = `/series/${seriesSlug}/${entry.slug}`;
            const active = pathname === href;
            return (
              <Link
                key={entry.id}
                href={href}
                onClick={onNavigate}
                className={cn(
                  "relative truncate rounded-md py-1.5 pr-2 text-[13.5px] transition-colors duration-150 ease-out",
                  active
                    ? "bg-[rgba(143,63,77,0.08)] font-medium text-[#8F3F4D]"
                    : "text-content-text hover:bg-hover-bg hover:text-[rgba(20,22,26,0.92)]",
                )}
                style={{ paddingLeft: `${28 + depth * 12}px` }}
              >
                {/* Active: nen NHAT cung tong mau #8F3F4D (rgba(143,63,77,.08) -
                    theo yeu cau nguoi dung, tham khao 1 sidebar ngoai co nen day
                    sau muc dang chon) CONG voi thanh chi bao trai - truoc day
                    CHI co thanh chi bao + doi mau chu, khong co nen. Van giu
                    dung 1 accent #8F3F4D (mau nut "Viết bài" tren header, xem
                    TopHeaderBar.tsx) - KHONG quay lai nen xanh --primary-soft cu
                    (yeu cau nguoi dung truoc day: khong dung mau xanh nua) dung
                    tinh than "nen mau nhat" nhung van dung tong mau da chot.
                    left-0 CO DINH (khong theo paddingLeft thut le tung depth) -
                    bam sat mep trai CA hang, dung quy uoc active-indicator quen
                    thuoc cua sidebar dang cay. */}
                {active && (
                  <span
                    aria-hidden="true"
                    className="absolute top-0 bottom-0 left-0 w-0.5 rounded-full bg-[#8F3F4D]"
                  />
                )}
                {entry.icon && <span className="mr-1.5">{entry.icon}</span>}
                {entry.title}
              </Link>
            );
          })}
        </div>
      )}

      {open && children.length > 0 && (
        <div className="mt-1 flex flex-col gap-1">
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

  // Category dang chua Entry active (theo pathname hien tai) - tu mo san
  // accordion cua no, giong tinh than mockup nguoi dung gui (chi nhom chua
  // trang dang xem moi bung mo, con lai thu gon).
  const activeCategoryId =
    entries.find((e) => `/series/${seriesSlug}/${e.slug}` === pathname)?.categoryId ?? null;

  const [openIds, setOpenIds] = useState<Set<string>>(
    () => new Set(activeCategoryId ? [activeCategoryId] : []),
  );

  // Dieu huong sang Entry o category KHAC (pathname doi) - dam bao category
  // moi active LUON duoc mo, nhung KHONG dong lai cac category nguoi dung da
  // tu bam mo tay truoc do (cong don vao Set thay vi thay the). Goi setState
  // NGAY TRONG RENDER (khong qua useEffect) theo dung pattern "Adjusting
  // state when a prop changes" cua React - xem CreateCollectionModal.tsx
  // cung pattern nay.
  const [lastActiveCategoryId, setLastActiveCategoryId] = useState(activeCategoryId);
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
    <nav className="flex flex-col gap-1">
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
