"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { SeriesForm } from "@/components/series/SeriesForm";
import { SeriesTreeManager } from "@/components/series/SeriesTreeManager";
import { SeriesCardConfigForm } from "@/components/series/SeriesCardConfigForm";
import { SeriesDeleteButton } from "@/components/series/SeriesDeleteButton";
import type { ContentSeriesOverview } from "@/lib/api/content-series";

const TABS = [
  { key: "info", label: "Thông tin chung" },
  { key: "structure", label: "Cấu trúc" },
  { key: "card", label: "Thẻ hiển thị" },
  { key: "danger", label: "Vùng nguy hiểm" },
] as const;
type TabKey = (typeof TABS)[number]["key"];

// Trang quan ly truoc day xep 3 khoi (Thong tin chung/Cau truc/Vung nguy
// hiem) TUAN TU tren 1 trang dai - "Cấu trúc" (thu hay dung nhat khi soan
// Entry moi) nam duoi cung, phai cuon rat xa moi toi (yeu cau nguoi dung).
// Doi sang tabs - MOI tab van GIU MOUNTED (an bang class "hidden" thay vi
// conditional render/unmount) de KHONG mat du lieu dang go do trong SeriesForm
// (state cuc bo cua no) khi nguoi dung nhay qua tab "Cấu trúc" roi quay lai.
export function SeriesManageTabs({
  series,
  seriesSlug,
}: {
  series: ContentSeriesOverview;
  seriesSlug: string;
}) {
  const [active, setActive] = useState<TabKey>("info");

  return (
    <div>
      <div className="flex gap-1 border-b border-border">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setActive(tab.key)}
            className={cn(
              "relative cursor-pointer px-3.5 py-2.5 text-[13px] font-medium transition-colors duration-150 ease-out",
              active === tab.key
                ? tab.key === "danger"
                  ? "text-danger"
                  : "text-ink"
                : "text-ink-faint hover:text-ink-muted",
            )}
          >
            {tab.label}
            {active === tab.key && (
              <motion.div
                layoutId="series-manage-tab-indicator"
                className={cn(
                  "absolute inset-x-0 -bottom-px h-0.5 rounded-full",
                  tab.key === "danger" ? "bg-danger" : "bg-ink",
                )}
                transition={{ duration: 0.2, ease: "easeOut" }}
              />
            )}
          </button>
        ))}
      </div>

      <div className={cn("mt-6", active !== "info" && "hidden")}>
        <SeriesForm initial={series} />
      </div>

      <div className={cn("mt-6", active !== "structure" && "hidden")}>
        <SeriesTreeManager
          seriesSlug={seriesSlug}
          categories={series.categories}
          entries={series.entries}
        />
      </div>

      <div className={cn("mt-6", active !== "card" && "hidden")}>
        <SeriesCardConfigForm series={series} />
      </div>

      <div className={cn("mt-6", active !== "danger" && "hidden")}>
        <p className="mb-3 text-[13px] text-ink-faint">
          Xoá Series sẽ xoá luôn toàn bộ category và entry bên trong, không thể hoàn tác.
        </p>
        <SeriesDeleteButton seriesSlug={seriesSlug} />
      </div>
    </div>
  );
}
