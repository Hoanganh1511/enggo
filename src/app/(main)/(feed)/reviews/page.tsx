import Link from "next/link";
import { auth } from "@/auth";
import { ArrowRight, RotateCcw } from "lucide-react";
import { ElPageShell } from "@/components/english-learner/ElPageShell";
import { ElLoginPrompt, ElEmptyState } from "@/components/english-learner/ElStates";
import { listElCoursesAction, listElReviewsAction } from "@/actions/english-learner/english-learner";

// [2026-10-15] "/reviews" (spec muc 8) - danh sach Review + noi dung den han
// on. MVP: liet ke Review cua MOI Course (hien tai 1 Course demo) - khi co
// nhieu Course se tu mo rong, khong can sua trang nay.
export default async function ReviewsListPage() {
  const session = await auth();
  if (!session?.username) {
    return (
      <ElPageShell>
        <ElLoginPrompt />
      </ElPageShell>
    );
  }

  const courses = await listElCoursesAction().catch(() => []);
  const reviewsByCourse = await Promise.all(
    courses.map(async (c) => ({
      course: c,
      reviews: await listElReviewsAction(c.slug).catch(() => []),
    })),
  );
  const hasAny = reviewsByCourse.some((g) => g.reviews.length > 0);

  return (
    <ElPageShell>
      <h1 className="mb-5 text-[20px] font-bold text-ink">Ôn tập</h1>
      {!hasAny ? (
        <ElEmptyState
          title="Chưa có phiên ôn tập nào"
          hint="Review sẽ xuất hiện sau khi bạn học qua ít nhất 2 Unit."
        />
      ) : (
        <div className="flex flex-col gap-6">
          {reviewsByCourse
            .filter((g) => g.reviews.length > 0)
            .map((g) => (
              <div key={g.course.id} className="flex flex-col gap-2">
                <p className="text-[12px] font-semibold tracking-wide text-ink-muted uppercase">
                  {g.course.title}
                </p>
                {g.reviews.map((r) => (
                  <Link
                    key={r.id}
                    href={`/reviews/${r.id}`}
                    className="flex items-center gap-3 rounded-xl border border-border bg-surface p-4 hover:border-ink-faint"
                  >
                    <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary-soft text-primary">
                      <RotateCcw size={16} aria-hidden="true" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="text-[13.5px] font-semibold text-ink">{r.title}</p>
                      {r.description && (
                        <p className="truncate text-[11.5px] text-ink-muted">{r.description}</p>
                      )}
                    </div>
                    <span className="shrink-0 text-[12px] text-ink-muted">
                      {r.exerciseCount} câu
                    </span>
                    <ArrowRight size={15} className="shrink-0 text-ink-faint" aria-hidden="true" />
                  </Link>
                ))}
              </div>
            ))}
        </div>
      )}
    </ElPageShell>
  );
}
