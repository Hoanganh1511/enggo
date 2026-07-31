"use client";

import { useState } from "react";
import Link from "next/link";
import { Activity, Flame } from "lucide-react";
import { NGHE_NGHIEP } from "@/lib/discover/category-taxonomy";

export type FeedMode = "activity" | "hot";

// Cum bo loc 2 tang - chiem phan 75% con trong ben trai cum tab (xem
// HomeLayoutShell.tsx). Hang 1: 2 nut "Dong"/"Noi bat" (doi kieu sap xep,
// dieu huong qua query param nhu cu) + cac pill "Nghe nghiep" (CHI la UI
// state cuc bo, KHONG dieu huong - chon de loc danh sach Linh vuc hien ra o
// hang 2). Hang 2: pill "Linh vuc" thuoc nghe nghiep dang chon, MOI PILL LA
// 1 <Link> that toi /home/category/[slug] (dung chung co che optimistic voi
// TABS ben canh, xem onNavClick/activeHref truyen tu HomeLayoutShell).
const HomeCategoryBar = ({
  mode,
  onModeChange,
  activeHref,
  onNavClick,
}: {
  mode: FeedMode | string;
  onModeChange: (mode: FeedMode) => void;
  activeHref: string;
  onNavClick: (e: React.MouseEvent<HTMLAnchorElement>, href: string) => void;
}) => {
  const [ngheNghiepSlug, setNgheNghiepSlug] = useState(NGHE_NGHIEP[0].slug);
  const activeNgheNghiep =
    NGHE_NGHIEP.find((n) => n.slug === ngheNghiepSlug) ?? NGHE_NGHIEP[0];

  return (
    <div className="flex min-w-0 flex-col gap-2">
      <div className="flex min-w-0 items-start gap-4">
        <div className="flex shrink-0 items-start gap-4">
          <button
            type="button"
            onClick={() => onModeChange("activity")}
            className="flex shrink-0 cursor-pointer flex-col items-center gap-1 rounded-md py-1 transition-colors duration-150 ease-out"
          >
            <span
              className={`flex size-8 items-center justify-center rounded-full ${
                mode === "activity" ? "bg-amber-400/15" : "bg-surface-muted"
              }`}
            >
              <Activity
                size={16}
                strokeWidth={2.25}
                className={
                  mode === "activity" ? "text-amber-500" : "text-ink-faint"
                }
              />
            </span>
            <span
              className={`text-[11px] font-medium ${
                mode === "activity" ? "text-amber-500" : "text-ink-faint"
              }`}
            >
              Động
            </span>
          </button>

          <button
            type="button"
            onClick={() => onModeChange("hot")}
            className="flex shrink-0 cursor-pointer flex-col items-center gap-1 rounded-md py-1 transition-colors duration-150 ease-out"
          >
            <span
              className={`flex size-8 items-center justify-center rounded-full ${
                mode === "hot" ? "bg-rose-500/15" : "bg-surface-muted"
              }`}
            >
              <Flame
                size={16}
                strokeWidth={2.25}
                className={mode === "hot" ? "text-rose-500" : "text-ink-faint"}
              />
            </span>
            <span
              className={`text-[11px] font-medium ${
                mode === "hot" ? "text-rose-500" : "text-ink-faint"
              }`}
            >
              Nổi bật
            </span>
          </button>
        </div>

        {/* Nghe nghiep - UI cuc bo, khong dieu huong, chi loc Linh vuc o duoi */}
        <div className="flex min-w-0 flex-1 flex-wrap items-center gap-2 pt-1.5">
          {NGHE_NGHIEP.map((nghe) => {
            const active = nghe.slug === ngheNghiepSlug;
            return (
              <button
                key={nghe.slug}
                type="button"
                onClick={() => setNgheNghiepSlug(nghe.slug)}
                className={`shrink-0 cursor-pointer rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors duration-150 ease-out ${
                  active
                    ? "border-primary text-primary"
                    : "border-border text-ink-muted hover:bg-hover-bg hover:text-ink"
                }`}
              >
                {nghe.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Linh vuc thuoc nghe nghiep dang chon - dieu huong that toi
          /home/category/[slug] */}
      <div className="flex min-w-0 flex-wrap items-center gap-2 pl-26">
        {activeNgheNghiep.linhVuc.map((lv) => {
          const href = `/home/category/${lv.slug}`;
          const active = activeHref === href;
          return (
            <Link
              key={lv.slug}
              href={href}
              onClick={(e) => onNavClick(e, href)}
              className={`shrink-0 cursor-pointer rounded-full border px-3 py-1.5 text-xs font-medium transition-colors duration-150 ease-out ${
                active
                  ? "border-primary bg-active-bg text-primary"
                  : "border-border text-ink-muted hover:bg-hover-bg hover:text-ink"
              }`}
            >
              {lv.label}
            </Link>
          );
        })}
      </div>
    </div>
  );
};

export default HomeCategoryBar;
