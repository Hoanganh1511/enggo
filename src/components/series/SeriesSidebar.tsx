"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
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
}: {
  category: ContentSeriesCategory;
  depth: number;
  byParent: Map<string | null, ContentSeriesCategory[]>;
  entriesByCategory: Map<string, ContentSeriesEntrySummary[]>;
  seriesSlug: string;
  pathname: string;
  onNavigate?: () => void;
}) {
  const children = byParent.get(category.id) ?? [];
  const entries = entriesByCategory.get(category.id) ?? [];

  return (
    <div>
      {/* Ten category van noi bat hon entry con ben duoi de thay ngay cap
          bac cha/con, nhung KHONG dung font-bold/text-ink (qua dam, chenh
          lech gay gat voi entry - yeu cau nguoi dung "đừng bold đậm, cho
          font size nhỏ đi, nhẹ nhàng phân cấp"): chi con size nho hon 1 chut
          (12px, dong bo voi entry) + font-semibold (vua du de tach lop, khong
          dam nhu font-bold). Dung bien --content-text (rgba(20,22,26,.8) -
          xem globals.css) THEO YEU CAU RIENG cho sidebar Series nay (khac
          --ink-muted token chung cua app) - dung CHUNG mau nay voi entry ben
          duoi de ca 2 cap deu cung 1 "tong" nhat, chi khac o do dam
          font-weight/size. Truoc day la rgba(20,22,26,.62) viet tay lap lai
          nhieu cho, gio gom ve 1 bien dat ten. */}
      <p
        className="flex items-center gap-1.5 px-2.5 text-[12px] font-semibold text-content-text"
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
      <div className="mt-2 flex flex-col gap-0.5">
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
              style={{ paddingLeft: `${18 + depth * 12}px` }}
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
      {children.length > 0 && (
        <div className="mt-3 flex flex-col gap-3">
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
        />
      ))}
    </nav>
  );
}
