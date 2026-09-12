"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import type { ContentSeriesCategory, ContentSeriesEntrySummary } from "@/lib/api/content-series";

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
  for (const list of byParent.values()) list.sort((a, b) => a.orderIndex - b.orderIndex);
  return byParent;
}

function CategoryNode({
  category,
  depth,
  byParent,
  entriesByCategory,
  seriesSlug,
  pathname,
}: {
  category: ContentSeriesCategory;
  depth: number;
  byParent: Map<string | null, ContentSeriesCategory[]>;
  entriesByCategory: Map<string, ContentSeriesEntrySummary[]>;
  seriesSlug: string;
  pathname: string;
}) {
  const children = byParent.get(category.id) ?? [];
  const entries = entriesByCategory.get(category.id) ?? [];

  return (
    <div>
      <p
        className="flex items-center gap-1.5 px-2.5 text-[11px] font-semibold tracking-wide text-ink-faint uppercase"
        style={{ paddingLeft: `${10 + depth * 12}px` }}
      >
        {category.colorHex && (
          <span
            className="inline-block size-1.5 shrink-0 rounded-full"
            style={{ backgroundColor: category.colorHex }}
            aria-hidden="true"
          />
        )}
        {category.title}
      </p>
      <div className="mt-1.5 flex flex-col gap-0.5">
        {entries.map((entry) => {
          const href = `/series/${seriesSlug}/${entry.slug}`;
          const active = pathname === href;
          return (
            <Link
              key={entry.id}
              href={href}
              className={cn(
                "truncate rounded-md py-1.5 pr-2 text-[13px] transition-colors duration-150 ease-out",
                active
                  ? "bg-primary-soft font-medium text-primary"
                  : "text-ink-faint hover:bg-hover-bg hover:text-ink-muted",
              )}
              style={{ paddingLeft: `${18 + depth * 12}px` }}
            >
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
}: {
  seriesSlug: string;
  categories: ContentSeriesCategory[];
  entries: ContentSeriesEntrySummary[];
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
  for (const list of entriesByCategory.values()) list.sort((a, b) => a.orderIndex - b.orderIndex);

  return (
    <nav className="flex flex-col gap-5">
      {roots.map((root) => (
        <CategoryNode
          key={root.id}
          category={root}
          depth={0}
          byParent={byParent}
          entriesByCategory={entriesByCategory}
          seriesSlug={seriesSlug}
          pathname={pathname}
        />
      ))}
    </nav>
  );
}
