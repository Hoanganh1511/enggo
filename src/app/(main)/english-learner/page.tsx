import { getEnglishTodayAction } from "@/actions/english-learner/english-learner";
import { TodayCard } from "@/components/english-learner/TodayCard";

export default async function EnglishLearnerPage() {
  const today = await getEnglishTodayAction();
  return (
    <div className="mx-auto max-w-xl px-4 py-10">
      <h1 className="text-lg font-semibold text-[var(--ink)]">Daily English Check</h1>
      <div className="mt-6">
        <TodayCard today={today} />
      </div>
    </div>
  );
}
