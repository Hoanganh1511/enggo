import { auth } from "@/auth";
import { ElPageShell } from "@/components/english-learner/ElPageShell";
import { ElLoginPrompt, ElEmptyState } from "@/components/english-learner/ElStates";
import { listElMistakesAction } from "@/actions/english-learner/english-learner";

// [2026-10-15] So loi sai (spec muc 8) - danh sach cau ma LAN TRA LOI GAN
// NHAT cua nguoi dung van SAI (khong phai moi lan sai tung xay ra - xem
// backend listMistakes(): 1 cau tung sai roi sua dung se TU DONG bien mat
// khoi danh sach nay, dung tinh than "không mặc định 1 câu sai = yếu cả chủ
// đề", chi hien dung nhung gi CON can on).
export default async function MistakesPage() {
  const session = await auth();
  if (!session?.username) {
    return (
      <ElPageShell>
        <ElLoginPrompt />
      </ElPageShell>
    );
  }

  const mistakes = await listElMistakesAction(50).catch(() => []);

  return (
    <ElPageShell>
      <h1 className="mb-1 text-[20px] font-bold text-ink">Sổ lỗi sai</h1>
      <p className="mb-5 text-[12.5px] text-ink-muted">
        Những câu bạn từng trả lời sai và chưa sửa lại đúng.
      </p>
      {mistakes.length === 0 ? (
        <ElEmptyState title="Không có lỗi nào" hint="Mọi câu bạn từng sai đều đã được sửa đúng." />
      ) : (
        <div className="flex flex-col gap-2.5">
          {mistakes.map((m) => (
            <div key={m.attemptId} className="rounded-xl border border-border bg-surface p-4">
              <div className="min-w-0">
                <p className="text-[13px] font-semibold text-ink">{m.conceptTitle}</p>
                <p className="text-[11.5px] text-ink-muted">{m.unitTitle}</p>
              </div>
              <p className="font-content mt-2.5 text-[12.5px] text-ink">
                {m.exercise.instruction}
              </p>
            </div>
          ))}
        </div>
      )}
    </ElPageShell>
  );
}
