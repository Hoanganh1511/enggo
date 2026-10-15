import { auth } from "@/auth";
import { ElPageShell } from "@/components/english-learner/ElPageShell";
import { ElLoginPrompt, ElEmptyState } from "@/components/english-learner/ElStates";
import { ExerciseSession } from "@/components/english-learner/ExerciseSession";
import { listElUnitExercisesAction } from "@/actions/english-learner/english-learner";

// [2026-10-15] Unit Test - CUNG danh sach exercise voi /practice, CHI khac
// `revealImmediately=false` (khong lo dung/sai/giai thich tung cau - spec
// muc 6: "Không tiết lộ đáp án trước khi submit trong chế độ kiểm tra" -
// mo rong: ca SAU khi submit 1 cau cung chua lo, chi lo TOAN BO sau khi
// "Hoàn thành" ca bai, xem ExerciseSession) va `context="UNIT_TEST"` (anh
// huong cach tinh "concept mastery" - xem recomputeConcept() backend: ket
// qua UNIT_TEST khong tinh vao "lan tra loi gan nhat" dung de suy trang
// thai Concept, tranh 1 lan thi kem lam "mat" trang thai MASTERED da dat
// duoc tu luyen tap truoc do).
export default async function UnitTestPage({
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

  const exercises = await listElUnitExercisesAction(courseSlug, unitSlug).catch(() => []);

  return (
    <ElPageShell wide>
      <h1 className="mb-2 text-[20px] font-bold text-ink">Unit Test</h1>
      <p className="mb-5 text-[12.5px] text-ink-muted">
        Đáp án và giải thích chỉ hiện sau khi bạn hoàn thành toàn bộ bài kiểm tra.
      </p>
      {exercises.length === 0 ? (
        <ElEmptyState title="Unit này chưa có bài kiểm tra nào." />
      ) : (
        <ExerciseSession
          exercises={exercises}
          context="UNIT_TEST"
          revealImmediately={false}
          title="Unit Test"
          finishHref={`/courses/${courseSlug}/units/${unitSlug}`}
          finishLabel="Quay lại Unit"
        />
      )}
    </ElPageShell>
  );
}
