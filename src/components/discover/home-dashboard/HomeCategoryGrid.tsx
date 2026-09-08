import {
  ArrowRight,
  Briefcase,
  Cpu,
  GraduationCap,
  Megaphone,
  Palette,
  Sparkles,
  Users,
  Wallet,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { motion } from "framer-motion";
import type { FeedCategoryGroup } from "@/lib/api/feed-categories";
import { EmptyState } from "./EmptyState";

const GROUP_ICON: Record<string, LucideIcon> = {
  cpu: Cpu,
  palette: Palette,
  megaphone: Megaphone,
  briefcase: Briefcase,
  wallet: Wallet,
  users: Users,
  "graduation-cap": GraduationCap,
};
const GROUP_TONE = [
  "bg-blue-50 text-blue-500",
  "bg-amber-50 text-amber-500",
  "bg-emerald-50 text-emerald-500",
  "bg-indigo-50 text-indigo-500",
  "bg-orange-50 text-orange-500",
  "bg-rose-50 text-rose-500",
] as const;

// Luoi "Browse by category" - THUAN presentational (state activeGroupSlug
// song o use-article-filter.ts, component nay chi nhan + goi lai onToggle),
// dung chung duoc voi ca Server/Client parent.
export function HomeCategoryGrid({
  categoryTree,
  activeGroupSlug,
  onToggle,
}: {
  categoryTree: FeedCategoryGroup[];
  activeGroupSlug: string | null;
  onToggle: (slug: string) => void;
}) {
  if (categoryTree.length === 0) {
    return <EmptyState message="Chưa có lĩnh vực nào hoạt động trong 7 ngày qua." />;
  }

  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-5" role="group" aria-label="Lọc theo lĩnh vực">
      {categoryTree.slice(0, 5).map((g, i) => {
        const Icon = GROUP_ICON[g.icon ?? ""] ?? Sparkles;
        const active = g.slug === activeGroupSlug;
        return (
          <motion.button
            key={g.slug}
            type="button"
            whileHover={{ y: -3 }}
            aria-pressed={active}
            onClick={() => onToggle(g.slug)}
            className={`group rounded-xl border p-4 text-left transition hover:shadow-sm ${
              active ? "border-slate-300 shadow-sm" : "border-[#edf0f4] hover:border-slate-200"
            }`}
          >
            <div className={`mb-4 flex h-8 w-8 items-center justify-center rounded-lg ${GROUP_TONE[i % GROUP_TONE.length]}`}>
              <Icon size={18} aria-hidden="true" />
            </div>
            <div className="text-[14px] font-semibold">{g.name}</div>
            <div className="mt-1 flex items-center justify-between text-[12px] text-slate-400">
              <span>{g.postCount} articles</span>
              <ArrowRight size={15} className="transition group-hover:translate-x-1" />
            </div>
          </motion.button>
        );
      })}
    </div>
  );
}
