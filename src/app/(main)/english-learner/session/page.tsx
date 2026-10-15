import { startEnglishSessionAction } from "@/actions/english-learner/english-learner";
import { SessionShell } from "@/components/english-learner/SessionShell";

export default async function EnglishLearnerSessionPage() {
  const session = await startEnglishSessionAction();
  return (
    <div className="mx-auto max-w-xl px-4 py-10">
      <SessionShell initialSession={session} />
    </div>
  );
}
