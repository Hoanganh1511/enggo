"use client";

import Link from "next/link";
import { Filter, Plus, Search } from "lucide-react";

export type ProfileContentSubTab = { key: string; label: string };

// Khung tren cung cua khu vuc noi dung tab profile - DUNG CHUNG cho ca 6
// tab (Trang chu/Bai dang/Danh sach phat/Bo suu tap/Thich/Lich su), theo
// mockup "WriteHub": search That (loc client-side tren du lieu da fetch,
// xem ProfileArticleGrid.tsx) + icon filter "Sắp có" (chua co tieu chi loc
// nao khac ngoai search/sub-tab) + nut "+ Tao..." (That khi co createHref -
// hien tai chi Bai dang co /compose That, cac tab con lai disabled "Sắp
// có") + hang sub-tab Tat ca/Cong khai/Rieng tu (chi truyen o Bai dang, loc
// That theo Post.visibility - cac tab khac khong truyen subTabs nen khong
// hien hang nay, tranh gia loc khong co y nghia).
export function ProfileContentHeader({
  title,
  description,
  searchValue,
  onSearchChange,
  createHref,
  createLabel,
  subTabs,
  activeSubTab,
  onSubTabChange,
}: {
  title: string;
  description?: string;
  searchValue: string;
  onSearchChange: (value: string) => void;
  createHref?: string;
  createLabel: string;
  subTabs?: ProfileContentSubTab[];
  activeSubTab?: string;
  onSubTabChange?: (key: string) => void;
}) {
  return (
    <div className="flex flex-col gap-3 py-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <h2 className="text-lg font-bold text-ink">{title}</h2>
          {description && (
            <p className="mt-0.5 text-[13px] text-ink-faint">{description}</p>
          )}
        </div>
        {/* Luon la 1 hang RIENG, RONG HET container (khong con nam chung
            hang voi title qua flex-wrap - do la ly do cum nay truoc kia bi
            "co lai" ben trai thay vi choan het chieu rong tren man hinh
            hep). O tim kiem flex-1 de choan het khoang con lai, filter/nut
            tao giu nguyen kich thuoc. */}
        <div className="flex items-center gap-2 sm:shrink-0">
          <div className="relative min-w-0 flex-1 sm:flex-initial">
            <Search
              size={14}
              className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-ink-faint"
            />
            <input
              value={searchValue}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Tìm kiếm..."
              className="h-9 w-full rounded-full border border-border bg-surface pr-3 pl-8 text-sm text-ink outline-none focus:border-primary/50 sm:w-52"
            />
          </div>
          <button
            type="button"
            disabled
            title="Sắp có"
            className="flex size-9 shrink-0 cursor-not-allowed items-center justify-center rounded-full border border-border text-ink-faint"
          >
            <Filter size={14} strokeWidth={2} />
          </button>
          {createHref ? (
            <Link
              href={createHref}
              className="flex h-9 shrink-0 items-center gap-1.5 rounded-full bg-ink px-3.5 text-sm font-semibold text-surface transition-opacity duration-150 ease-out hover:opacity-90"
            >
              <Plus size={14} strokeWidth={2.5} />
              {createLabel}
            </Link>
          ) : (
            <button
              type="button"
              disabled
              title="Sắp có"
              className="flex h-9 shrink-0 cursor-not-allowed items-center gap-1.5 rounded-full bg-surface-muted px-3.5 text-sm font-semibold text-ink-faint"
            >
              <Plus size={14} strokeWidth={2.5} />
              {createLabel}
            </button>
          )}
        </div>
      </div>

      {subTabs && subTabs.length > 0 && (
        <div className="flex items-center gap-1 overflow-x-auto border-b border-border">
          {subTabs.map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => onSubTabChange?.(tab.key)}
              className={`-mb-px shrink-0 cursor-pointer border-b-2 px-3 py-2 text-sm font-medium transition-colors duration-150 ease-out ${
                activeSubTab === tab.key
                  ? "border-primary text-primary"
                  : "border-transparent text-ink-muted hover:text-ink"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
