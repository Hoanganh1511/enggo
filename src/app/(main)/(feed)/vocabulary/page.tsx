import { auth } from "@/auth";
import { ElPageShell } from "@/components/english-learner/ElPageShell";
import { ElLoginPrompt, ElEmptyState } from "@/components/english-learner/ElStates";
import { VocabularyCard } from "@/components/english-learner/ConceptBlock";
import { listElCoursesAction, listElVocabularyAction } from "@/actions/english-learner/english-learner";

// [2026-10-15] Thu vien tu vung (spec muc 8) - FLAT toan bo ElVocabularyItem
// cua Course demo, nhom theo Unit de van biet tu nao thuoc bai nao. Tai dung
// VocabularyCard (CUNG component voi trang Lesson) - khong ve lai the tu
// rieng cho trang nay.
export default async function VocabularyLibraryPage() {
  const session = await auth();
  if (!session?.username) {
    return (
      <ElPageShell>
        <ElLoginPrompt />
      </ElPageShell>
    );
  }

  const courses = await listElCoursesAction().catch(() => []);
  const course = courses[0];
  const items = course ? await listElVocabularyAction(course.slug).catch(() => []) : [];

  const byUnit = new Map<string, typeof items>();
  for (const item of items) {
    const key = item.unitTitle;
    if (!byUnit.has(key)) byUnit.set(key, []);
    byUnit.get(key)!.push(item);
  }

  return (
    <ElPageShell>
      <h1 className="mb-5 text-[20px] font-bold text-ink">Thư viện từ vựng</h1>
      {items.length === 0 ? (
        <ElEmptyState title="Chưa có từ vựng nào" />
      ) : (
        <div className="flex flex-col gap-6">
          {[...byUnit.entries()].map(([unitTitle, unitItems]) => (
            <div key={unitTitle} className="flex flex-col gap-2.5">
              <p className="text-[12px] font-semibold tracking-wide text-ink-muted uppercase">
                {unitTitle} · {unitItems.length} từ
              </p>
              {unitItems.map((item) => (
                <VocabularyCard key={item.id} item={item} />
              ))}
            </div>
          ))}
        </div>
      )}
    </ElPageShell>
  );
}
