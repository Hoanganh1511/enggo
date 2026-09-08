import Link from "next/link";
import type { ApiJourney } from "@/lib/api/types";
import { EmptyState } from "./EmptyState";

// Server Component thuan - chi hien thi, khong co state/tuong tac nao (bam
// "View all" la Link dieu huong that, khong can JS phia client).
export function HomeRoadmapCard({
  journey,
  workspaceHref,
}: {
  journey: ApiJourney;
  workspaceHref: string | null;
}) {
  return (
    <div className="rounded-xl border border-[#edf0f4] bg-white p-5">
      <div className="flex items-center justify-between">
        <h2 className="text-[15px] font-bold">My Learning Roadmap</h2>
        {workspaceHref && (
          <Link href={workspaceHref} className="text-[13px] text-slate-500">
            View all
          </Link>
        )}
      </div>
      <div className="mt-5">
        {journey.groups.length === 0 ? (
          <EmptyState message="Chưa có nhóm kiến thức nào — tạo nhóm đầu tiên trong Workspace." />
        ) : (
          journey.groups.slice(0, 5).map((g, i, arr) => (
            <div key={g.id} className="relative flex gap-4 pb-5 last:pb-0">
              <div className="relative flex w-5 shrink-0 justify-center">
                <div
                  className={`z-[1] mt-0.5 h-3.5 w-3.5 rounded-full border-2 ${
                    g.progressPercent > 0 ? "border-blue-500 bg-blue-500" : "border-slate-300 bg-white"
                  }`}
                />
                {i < arr.length - 1 && <div className="absolute top-4 h-full w-px bg-slate-200" />}
              </div>
              <div className="font-content min-w-0 flex-1">
                <div className="text-[13px] font-medium">{g.name}</div>
                <div className="mt-0.5 truncate text-[12px] text-slate-400">
                  {g.description || "Chưa có mô tả"}
                </div>
                {g.progressPercent > 0 && (
                  <div className="mt-2 flex items-center gap-2">
                    <div
                      className="h-1.5 flex-1 overflow-hidden rounded-full bg-slate-100"
                      role="progressbar"
                      aria-valuenow={g.progressPercent}
                      aria-valuemin={0}
                      aria-valuemax={100}
                      aria-label={`Tiến độ ${g.name}`}
                    >
                      <div className="h-full rounded-full bg-blue-500" style={{ width: `${g.progressPercent}%` }} />
                    </div>
                    <span className="text-[11px] text-slate-500">{g.progressPercent}%</span>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
