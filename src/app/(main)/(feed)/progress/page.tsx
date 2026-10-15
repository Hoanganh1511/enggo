import Link from "next/link";
import { auth } from "@/auth";
import { ElPageShell } from "@/components/english-learner/ElPageShell";
import { ElLoginPrompt, ElEmptyState } from "@/components/english-learner/ElStates";
import {
  listElCoursesAction,
  getElCourseProgressAction,
} from "@/actions/english-learner/english-learner";
import { EL_PROGRESS_STATUS_META } from "@/lib/english-learner/domain";

// [2026-10-15] Bao cao tien do (spec muc 8) - tien do THAT, tinh tu
// ElLearningProgress (recomputeProgress() backend, KHONG phai so lieu bia -
// spec muc 10). MVP: 1 Course -> hien bao cao cua Course do truc tiep.
export default async function ProgressPage() {
  const session = await auth();
  if (!session?.username) {
    return (
      <ElPageShell>
        <ElLoginPrompt />
      </ElPageShell>
    );
  }

  const courses = await listElCoursesAction().catch(() => []);
  if (courses.length === 0) {
    return (
      <ElPageShell>
        <ElEmptyState title="Chưa có khóa học nào" />
      </ElPageShell>
    );
  }

  const course = courses[0];
  const progress = await getElCourseProgressAction(course.slug);
  const meta = EL_PROGRESS_STATUS_META[progress.status];

  return (
    <ElPageShell>
      <h1 className="mb-5 text-[20px] font-bold text-ink">Tiến độ học tập</h1>

      <div className="rounded-2xl border border-border bg-surface p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[13px] font-semibold text-ink">{course.title}</p>
            <p className="text-[11.5px] text-ink-muted">
              {progress.completedUnits}/{progress.totalUnits} Unit hoàn thành
            </p>
          </div>
          <span
            className="rounded-full px-2.5 py-1 text-[12px] font-medium"
            style={{ backgroundColor: `${meta.color}1a`, color: meta.color }}
          >
            {meta.label}
          </span>
        </div>
        <div className="mt-4 h-2 overflow-hidden rounded-full bg-border">
          <div
            className="h-full rounded-full bg-primary transition-all"
            style={{ width: `${progress.progressPercent}%` }}
          />
        </div>
        <p className="mt-1.5 text-[11.5px] text-ink-muted">{progress.progressPercent}% hoàn thành</p>
      </div>

      <div className="mt-5 flex flex-col gap-2">
        {progress.units.map((u) => {
          const unitMeta = EL_PROGRESS_STATUS_META[u.status];
          return (
            <Link
              key={u.slug}
              href={`/courses/${course.slug}/units/${u.slug}`}
              className="flex items-center justify-between rounded-xl border border-border bg-surface p-4 hover:border-ink-faint"
            >
              <span className="text-[13px] font-medium text-ink">{u.title}</span>
              <span className="flex items-center gap-3">
                <span className="h-1.5 w-24 overflow-hidden rounded-full bg-border">
                  <span
                    className="block h-full rounded-full"
                    style={{ width: `${u.progressPercent}%`, backgroundColor: unitMeta.color }}
                  />
                </span>
                <span className="w-9 text-right text-[11.5px] text-ink-muted">
                  {u.progressPercent}%
                </span>
              </span>
            </Link>
          );
        })}
      </div>
    </ElPageShell>
  );
}
