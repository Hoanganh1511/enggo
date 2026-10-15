import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { ElPageShell } from "@/components/english-learner/ElPageShell";
import { ElEmptyState, ElDemoBadge } from "@/components/english-learner/ElStates";
import { listElCoursesAction } from "@/actions/english-learner/english-learner";

export default async function CoursesListPage() {
  const courses = await listElCoursesAction().catch(() => []);

  return (
    <ElPageShell>
      <h1 className="mb-5 text-[20px] font-bold text-ink">Khóa học</h1>
      {courses.length === 0 ? (
        <ElEmptyState title="Chưa có khóa học nào" />
      ) : (
        <div className="flex flex-col gap-3">
          {courses.map((c) => (
            <Link
              key={c.id}
              href={`/courses/${c.slug}`}
              className="flex items-center justify-between gap-4 rounded-2xl border border-border bg-surface p-5 transition hover:border-ink-faint"
            >
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-[15px] font-bold text-ink">{c.title}</p>
                  {c.isDemo && <ElDemoBadge />}
                </div>
                <p className="mt-1 line-clamp-2 text-[12.5px] text-ink-muted">{c.description}</p>
                <div className="mt-2 flex items-center gap-3 text-[11.5px] text-ink-muted">
                  <span className="rounded-full bg-surface-muted px-2 py-0.5 font-medium">
                    CEFR {c.level}
                  </span>
                  <span>{c.unitCount} Unit</span>
                </div>
              </div>
              <ArrowRight size={18} className="shrink-0 text-ink-faint" aria-hidden="true" />
            </Link>
          ))}
        </div>
      )}
    </ElPageShell>
  );
}
