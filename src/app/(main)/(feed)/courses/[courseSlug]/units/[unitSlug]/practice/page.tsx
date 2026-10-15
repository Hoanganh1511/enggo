import { auth } from "@/auth";
import { ElPageShell } from "@/components/english-learner/ElPageShell";
import { ElLoginPrompt, ElEmptyState } from "@/components/english-learner/ElStates";
import { ExerciseSession } from "@/components/english-learner/ExerciseSession";
import { listElUnitExercisesAction } from "@/actions/english-learner/english-learner";

export default async function UnitPracticePage({
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
      <h1 className="mb-5 text-[20px] font-bold text-ink">Luyện tập</h1>
      {exercises.length === 0 ? (
        <ElEmptyState title="Unit này chưa có bài tập nào." />
      ) : (
        <ExerciseSession
          exercises={exercises}
          context="PRACTICE"
          revealImmediately
          title="Luyện tập tự do"
          finishHref={`/courses/${courseSlug}/units/${unitSlug}`}
          finishLabel="Quay lại Unit"
        />
      )}
    </ElPageShell>
  );
}
