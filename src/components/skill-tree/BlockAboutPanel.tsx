import { FileText } from "lucide-react";
import type { ApiCategory, ApiNodeListItem } from "@/lib/api/types";
import { computeCategoryStats } from "@/lib/skill-tree/category-stats";
import { getStatusStyle } from "@/lib/skill-tree/status-style";

const KEY_TOPICS_LIMIT = 5;

type BlockAboutPanelProps = {
  category: ApiCategory;
  nodes: ApiNodeListItem[];
};

// Panel phai cua trang chi tiet block KHI CHUA chon skill nao - thay cho
// thong bao trong "Chon 1 node..." chung chung, hien mo ta + so lieu cua
// chinh block dang xem (giong "About this block" trong anh mau). Khi da
// chon 1 skill, SkillTreePage se doi sang SkillDetailPanel nhu cu (khong
// dung file nay nua) - khong dung data "Key Topics" rieng (chua co field
// that), tam dung lai skillTitles (ten cac skill) lam dai dien.
const BlockAboutPanel = ({ category, nodes }: BlockAboutPanelProps) => {
  const stats = computeCategoryStats(category, nodes);
  const style = getStatusStyle(stats.status);
  const keyTopics = stats.skillTitles.slice(0, KEY_TOPICS_LIMIT);

  return (
    <aside className="flex w-80 shrink-0 flex-col gap-4 overflow-y-auto border-l border-border bg-surface p-4">
      <div className="flex items-center gap-2">
        <FileText size={16} strokeWidth={1.75} className="text-ink-faint" />
        <p className="text-sm font-semibold text-ink">About this block</p>
      </div>

      {category.description ? (
        <p className="text-sm text-ink-muted">{category.description}</p>
      ) : (
        <p className="text-sm text-ink-faint italic">Chưa có mô tả.</p>
      )}

      {keyTopics.length > 0 && (
        <div>
          <p className="mb-1.5 text-[10px] font-semibold tracking-wide text-ink-faint uppercase">
            Key Topics
          </p>
          <ul className="flex flex-col gap-1">
            {keyTopics.map((title) => (
              <li
                key={title}
                className="flex items-center gap-2 text-sm text-ink-muted"
              >
                <span className="size-1 shrink-0 rounded-full bg-ink-faint" />
                {title}
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="mt-auto grid grid-cols-2 gap-2 border-t border-border pt-3">
        <div className="flex flex-col gap-0.5">
          <span className="text-[10px] text-ink-faint">Tổng skills</span>
          <span className="text-sm font-semibold text-ink">
            {stats.skillCount}
          </span>
        </div>
        <div className="flex flex-col gap-0.5">
          <span className="text-[10px] text-ink-faint">Mastery</span>
          <span className={`text-sm font-semibold ${style.textClass}`}>
            {stats.avgMasteryPercent}%
          </span>
        </div>
      </div>
    </aside>
  );
};

export default BlockAboutPanel;
