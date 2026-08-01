import Link from "next/link";

import type { ContestTab } from "@/lib/api/contests";
import { cn } from "@/lib/utils";

const TABS: { key: ContestTab; label: string }[] = [
  { key: "popular", label: "Phổ biến" },
  { key: "trending", label: "Xu hướng" },
  { key: "latest", label: "Mới nhất" },
];

// Tab dieu khien qua query param (?tab=) chu khong phai state client - cung
// loi voi bo loc feed, de chia se/tai lai trang van giu dung tab va trang chi
// tiet co the la Server Component (fetch dung tab ngay tu server).
export function ContestTabs({
  slug,
  active,
}: {
  slug: string;
  active: ContestTab;
}) {
  return (
    <div className="flex items-center gap-1 border-b border-border">
      {TABS.map((tab) => {
        const isActive = tab.key === active;
        return (
          <Link
            key={tab.key}
            href={`/contest/${slug}?tab=${tab.key}`}
            className={cn(
              "-mb-px border-b-2 px-3 py-2 text-sm font-medium transition-colors duration-150 ease-out",
              isActive
                ? "border-primary text-primary"
                : "border-transparent text-ink-muted hover:text-ink",
            )}
          >
            {tab.label}
          </Link>
        );
      })}
    </div>
  );
}
