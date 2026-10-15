import Link from "next/link";
import { auth } from "@/auth";
import { ArrowRight, BookOpen, ClipboardCheck } from "lucide-react";
import { ElPageShell } from "@/components/english-learner/ElPageShell";
import { ElLoginPrompt, ElErrorState } from "@/components/english-learner/ElStates";
import { getElUnitOverviewAction } from "@/actions/english-learner/english-learner";
import { EL_PROGRESS_STATUS_META } from "@/lib/english-learner/domain";

export default async function UnitOverviewPage({
  params,
}: {
  params: Promise<{ courseSlug: string; unitSlug: string }>;
}) {
  const { courseSlug, unitSlug } = await params;
  const session = await auth();
  if (!session?.username) {
    return (
      <ElPageShell>
        <ElLoginPrompt />
      </ElPageShell>
    );
  }

  const unit = await getElUnitOverviewAction(courseSlug, unitSlug).catch(() => null);
  if (!unit) {
    return (
      <ElPageShell>
        <ElErrorState message={`Không tìm thấy Unit "${unitSlug}".`} />
      </ElPageShell>
    );
  }

  const firstLesson = unit.sections[0]?.lessons[0];

  return (
    <ElPageShell>
      <div className="flex flex-col gap-6">
        <div>
          <p className="text-[12px] font-medium text-ink-muted">
            <Link href={`/courses/${courseSlug}`} className="hover:underline">
              {courseSlug.replace(/-/g, " ")}
            </Link>{" "}
            / Unit {unit.number}
          </p>
          <h1 className="mt-1 text-[20px] font-bold text-ink">{unit.title}</h1>
          {unit.description && (
            <p className="mt-2 text-[13px] leading-relaxed text-ink-muted">{unit.description}</p>
          )}
          {unit.objectives.length > 0 && (
            <ul className="mt-3 flex flex-col gap-1">
              {unit.objectives.map((o, i) => (
                <li key={i} className="text-[12.5px] text-ink-muted">
                  • {o}
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Luyen tap/Unit Test - KHONG bat buoc di theo thu tu (spec muc 8.3:
            "Không bắt buộc người học đi theo một luồng cứng nếu muốn ôn lại
            một Section đã học") - 2 diem vao truc tiep, luon san. */}
        <div className="flex gap-3">
          <Link
            href={`/courses/${courseSlug}/units/${unitSlug}/practice`}
            className="flex flex-1 items-center gap-2 rounded-xl border border-border bg-surface p-4 hover:border-ink-faint"
          >
            <BookOpen size={18} className="text-primary" aria-hidden="true" />
            <div>
              <p className="text-[13px] font-semibold text-ink">Luyện tập</p>
              <p className="text-[11.5px] text-ink-muted">{unit.exerciseCount} câu, xem đáp án ngay</p>
            </div>
          </Link>
          <Link
            href={`/courses/${courseSlug}/units/${unitSlug}/test`}
            className="flex flex-1 items-center gap-2 rounded-xl border border-border bg-surface p-4 hover:border-ink-faint"
          >
            <ClipboardCheck size={18} className="text-ink" aria-hidden="true" />
            <div>
              <p className="text-[13px] font-semibold text-ink">Unit Test</p>
              <p className="text-[11.5px] text-ink-muted">Làm hết rồi xem kết quả</p>
            </div>
          </Link>
        </div>

        <div className="flex flex-col gap-4">
          {unit.sections.map((s) => (
            <div key={s.id} className="flex flex-col gap-2">
              <p className="text-[12px] font-semibold tracking-wide text-ink-muted uppercase">
                {s.title}
              </p>
              {s.lessons.map((l) => {
                const meta = EL_PROGRESS_STATUS_META[l.status];
                return (
                  <Link
                    key={l.id}
                    href={`/courses/${courseSlug}/units/${unitSlug}/lessons/${l.slug}`}
                    className="flex items-center justify-between rounded-xl border border-border bg-surface p-4 hover:border-ink-faint"
                  >
                    <div className="min-w-0">
                      <p className="text-[13.5px] font-medium text-ink">{l.title}</p>
                      <p className="text-[11.5px] text-ink-muted">{l.conceptCount} concept</p>
                    </div>
                    <span className="flex shrink-0 items-center gap-2">
                      <span
                        className="rounded-full px-2 py-0.5 text-[11px] font-medium"
                        style={{ backgroundColor: `${meta.color}1a`, color: meta.color }}
                      >
                        {meta.label}
                      </span>
                      <ArrowRight size={15} className="text-ink-faint" aria-hidden="true" />
                    </span>
                  </Link>
                );
              })}
            </div>
          ))}
        </div>

        {firstLesson && (
          <Link
            href={`/courses/${courseSlug}/units/${unitSlug}/lessons/${firstLesson.slug}`}
            className="flex h-10 w-fit items-center gap-1.5 rounded-lg bg-primary px-4 text-[13px] font-semibold text-white hover:opacity-90"
          >
            Bắt đầu học
            <ArrowRight size={14} aria-hidden="true" />
          </Link>
        )}
      </div>
    </ElPageShell>
  );
}
