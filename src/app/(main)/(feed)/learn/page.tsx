import Link from "next/link";
import { auth } from "@/auth";
import { ArrowRight, Flame, XCircle } from "lucide-react";
import { ElPageShell } from "@/components/english-learner/ElPageShell";
import { ElLoginPrompt, ElEmptyState, ElDemoBadge } from "@/components/english-learner/ElStates";
import {
  listElCoursesAction,
  getElCourseOverviewAction,
  listElMistakesAction,
  listElReviewsAction,
} from "@/actions/english-learner/english-learner";
import { EL_PROGRESS_STATUS_META } from "@/lib/english-learner/domain";

// [2026-10-15] "/learn" - trang tong quan hoc tap (spec muc 8.1). Cau hoi
// trung tam: "Bây giờ tôi nên học gì tiếp theo?" - KHONG nhoi chart/KPI/
// gamification, chi: dang hoc gi, hoc tiep o dau, co bao nhieu loi can xem
// lai, co review nao dang cho. Server Component - tron 4-5 fetch de co du
// lieu, khong co interactivity rieng nen khong can "use client".
export default async function LearnDashboardPage() {
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
        <ElEmptyState title="Chưa có khóa học nào" hint="Dữ liệu demo chưa được seed." />
      </ElPageShell>
    );
  }

  // MVP chi co 1 Course - lay cai dau tien lam "khoa hoc dang hoc". Nhieu
  // Course hon sau nay thi day la noi can them logic chon "khoa hoc gan nhat
  // co hoat dong", chua can cho demo 1 khoa duy nhat.
  const course = courses[0];
  const [overview, mistakes, reviews] = await Promise.all([
    getElCourseOverviewAction(course.slug),
    listElMistakesAction(5),
    listElReviewsAction(course.slug),
  ]);

  // Unit "nen hoc tiep" - uu tien IN_PROGRESS, roi NEEDS_REVIEW, roi
  // NOT_STARTED dau tien theo thu tu - KHONG goi y lai Unit da COMPLETED/
  // MASTERED (spec: "không đồng nhất đã mở với đã học thành thạo", goi y
  // tiep theo phai la kien thuc THAT SU con can hoc).
  const nextUnit =
    overview.units.find((u) => u.status === "IN_PROGRESS") ??
    overview.units.find((u) => u.status === "NEEDS_REVIEW") ??
    overview.units.find((u) => u.status === "NOT_STARTED") ??
    overview.units[0];

  const totalUnits = overview.units.length;
  const doneUnits = overview.units.filter(
    (u) => u.status === "COMPLETED" || u.status === "MASTERED",
  ).length;

  return (
    <ElPageShell>
      <div className="flex flex-col gap-6">
        <div className="flex items-center gap-2">
          <h1 className="text-[20px] font-bold text-ink">Tổng quan học tập</h1>
          {course.isDemo && <ElDemoBadge />}
        </div>

        {/* --- Continue Learning --- */}
        {nextUnit && (
          <div className="rounded-2xl border border-border bg-surface p-5">
            <p className="text-[11.5px] font-semibold tracking-wide text-ink-muted uppercase">
              Tiếp tục học
            </p>
            <p className="mt-1.5 text-[12.5px] text-ink-muted">{course.title}</p>
            <p className="mt-1 text-[18px] font-bold text-ink">{nextUnit.title}</p>
            <div className="mt-3 flex items-center gap-3">
              <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-border">
                <div
                  className="h-full rounded-full bg-primary"
                  style={{ width: `${nextUnit.progressPercent}%` }}
                />
              </div>
              <span className="text-[12px] font-medium text-ink-muted">
                {nextUnit.progressPercent}%
              </span>
            </div>
            <Link
              href={`/courses/${course.slug}/units/${nextUnit.slug}`}
              className="mt-4 inline-flex h-9 items-center gap-1.5 rounded-lg bg-primary px-4 text-[13px] font-semibold text-white hover:opacity-90"
            >
              Tiếp tục
              <ArrowRight size={14} aria-hidden="true" />
            </Link>
          </div>
        )}

        {/* --- Progress overview --- */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          <StatTile label="Unit hoàn thành" value={`${doneUnits}/${totalUnits}`} />
          <StatTile
            label="Cần ôn lại"
            value={String(mistakes.length)}
            tone={mistakes.length > 0 ? "warning" : undefined}
          />
          <StatTile label="Bài ôn tập" value={String(reviews.length)} />
        </div>

        {/* --- Review due --- */}
        {reviews.length > 0 && (
          <Section title="Ôn tập đang chờ" icon={Flame} href="/reviews">
            <div className="flex flex-col gap-2">
              {reviews.slice(0, 3).map((r) => (
                <Link
                  key={r.id}
                  href={`/reviews/${r.id}`}
                  className="flex items-center justify-between rounded-lg border border-border px-3.5 py-2.5 hover:border-ink-faint"
                >
                  <span className="text-[13px] font-medium text-ink">{r.title}</span>
                  <span className="text-[12px] text-ink-muted">{r.exerciseCount} câu</span>
                </Link>
              ))}
            </div>
          </Section>
        )}

        {/* --- Recent mistakes --- */}
        <Section title="Lỗi gần đây" icon={XCircle} href="/mistakes">
          {mistakes.length === 0 ? (
            <p className="text-[12.5px] text-ink-muted">Chưa có lỗi nào - tốt lắm!</p>
          ) : (
            <div className="flex flex-col gap-2">
              {mistakes.slice(0, 3).map((m) => (
                <div
                  key={m.attemptId}
                  className="rounded-lg border border-border px-3.5 py-2.5"
                >
                  <p className="text-[12.5px] font-medium text-ink">{m.conceptTitle}</p>
                  <p className="text-[11.5px] text-ink-muted">{m.unitTitle}</p>
                </div>
              ))}
            </div>
          )}
        </Section>

        {/* --- Unit list ngan gon --- */}
        <Section title="Các Unit trong khóa học" icon={ArrowRight} href={`/courses/${course.slug}`}>
          <div className="flex flex-col gap-1.5">
            {overview.units.map((u) => {
              const meta = EL_PROGRESS_STATUS_META[u.status];
              return (
                <Link
                  key={u.id}
                  href={`/courses/${course.slug}/units/${u.slug}`}
                  className="flex items-center justify-between rounded-lg px-3 py-2 hover:bg-surface-muted"
                >
                  <span className="text-[13px] text-ink">
                    Unit {u.number}. {u.title}
                  </span>
                  <span
                    className="rounded-full px-2 py-0.5 text-[11px] font-medium"
                    style={{ backgroundColor: `${meta.color}1a`, color: meta.color }}
                  >
                    {meta.label}
                  </span>
                </Link>
              );
            })}
          </div>
        </Section>
      </div>
    </ElPageShell>
  );
}

function StatTile({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone?: "warning";
}) {
  return (
    <div className="rounded-xl border border-border bg-surface p-4">
      <p className="text-[11px] font-medium text-ink-muted">{label}</p>
      <p className={`mt-1 text-[22px] font-bold ${tone === "warning" ? "text-warning" : "text-ink"}`}>
        {value}
      </p>
    </div>
  );
}

function Section({
  title,
  icon: Icon,
  href,
  children,
}: {
  title: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  href: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-2.5">
      <div className="flex items-center justify-between">
        <span className="flex items-center gap-1.5 text-[13px] font-semibold text-ink">
          <Icon size={14} aria-hidden="true" />
          {title}
        </span>
        <Link href={href} className="text-[12px] font-medium text-primary hover:underline">
          Xem tất cả
        </Link>
      </div>
      {children}
    </div>
  );
}
