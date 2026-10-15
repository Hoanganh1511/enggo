import Link from "next/link";
import { auth } from "@/auth";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import { ElPageShell } from "@/components/english-learner/ElPageShell";
import { ElLoginPrompt, ElDemoBadge, ElErrorState } from "@/components/english-learner/ElStates";
import { getElCourseOverviewAction } from "@/actions/english-learner/english-learner";
import { EL_PROGRESS_STATUS_META, EL_UNIT_TYPE_META } from "@/lib/english-learner/domain";

export default async function CourseOverviewPage({
  params,
}: {
  params: Promise<{ courseSlug: string }>;
}) {
  const { courseSlug } = await params;
  const session = await auth();
  if (!session?.username) {
    return (
      <ElPageShell>
        <ElLoginPrompt />
      </ElPageShell>
    );
  }

  const course = await getElCourseOverviewAction(courseSlug).catch(() => null);
  if (!course) {
    return (
      <ElPageShell>
        <ElErrorState message={`Không tìm thấy khóa học "${courseSlug}".`} />
      </ElPageShell>
    );
  }

  return (
    <ElPageShell>
      <div className="flex flex-col gap-6">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-[20px] font-bold text-ink">{course.title}</h1>
            {course.isDemo && <ElDemoBadge />}
          </div>
          <p className="mt-2 text-[13px] leading-relaxed text-ink-muted">{course.description}</p>
        </div>

        {course.objectives.length > 0 && (
          <div className="rounded-xl border border-border bg-surface p-4">
            <p className="text-[11.5px] font-semibold tracking-wide text-ink-muted uppercase">
              Mục tiêu
            </p>
            <ul className="mt-2 flex flex-col gap-1.5">
              {course.objectives.map((o, i) => (
                <li key={i} className="flex items-start gap-2 text-[12.5px] text-ink">
                  <CheckCircle2 size={14} className="mt-0.5 shrink-0 text-primary" aria-hidden="true" />
                  {o}
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="flex flex-col gap-2">
          <p className="text-[13px] font-semibold text-ink">
            Các Unit ({course.units.length})
          </p>
          {course.units.map((u) => {
            const meta = EL_PROGRESS_STATUS_META[u.status];
            return (
              <Link
                key={u.id}
                href={`/courses/${course.slug}/units/${u.slug}`}
                className="flex items-center gap-4 rounded-xl border border-border bg-surface p-4 transition hover:border-ink-faint"
              >
                <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-surface-muted text-[13px] font-bold text-ink">
                  {u.number}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="truncate text-[13.5px] font-semibold text-ink">{u.title}</p>
                    <span className="shrink-0 rounded-full bg-surface-muted px-1.5 py-0.5 text-[10.5px] font-medium text-ink-muted">
                      {EL_UNIT_TYPE_META[u.type].label}
                    </span>
                  </div>
                  {u.description && (
                    <p className="truncate text-[11.5px] text-ink-muted">{u.description}</p>
                  )}
                </div>
                <span
                  className="shrink-0 rounded-full px-2 py-0.5 text-[11px] font-medium"
                  style={{ backgroundColor: `${meta.color}1a`, color: meta.color }}
                >
                  {meta.label}
                </span>
                <ArrowRight size={16} className="shrink-0 text-ink-faint" aria-hidden="true" />
              </Link>
            );
          })}
        </div>

        {course.reviews.length > 0 && (
          <div className="flex flex-col gap-2">
            <p className="text-[13px] font-semibold text-ink">Checkpoint ôn tập</p>
            {course.reviews.map((r) => (
              <Link
                key={r.id}
                href={`/reviews/${r.id}`}
                className="flex items-center justify-between rounded-xl border border-border bg-surface p-4 hover:border-ink-faint"
              >
                <span className="text-[13px] font-medium text-ink">{r.title}</span>
                <ArrowRight size={16} className="text-ink-faint" aria-hidden="true" />
              </Link>
            ))}
          </div>
        )}
      </div>
    </ElPageShell>
  );
}
