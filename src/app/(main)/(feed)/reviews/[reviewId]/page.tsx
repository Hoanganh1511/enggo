import { auth } from "@/auth";
import { ElPageShell } from "@/components/english-learner/ElPageShell";
import { ElLoginPrompt, ElErrorState } from "@/components/english-learner/ElStates";
import { ExerciseSession } from "@/components/english-learner/ExerciseSession";
import { generateElReviewSessionAction } from "@/actions/english-learner/english-learner";

// [2026-10-15] Phien Review (spec muc 8.6) - goi THANG server action tu
// Server Component (khong can "use client" + useEffect de POST luc mount -
// server action goi duoc nhu 1 ham async binh thuong trong RSC) de sinh
// danh sach cau hoi (uu tien cau dang sai, xem buildReviewSession backend),
// roi giao cho ExerciseSession (client) dieu phoi lam bai - PHAN BIET "cần
// ôn do quên" (mistakeCount) voi "nội dung chưa từng học" qua dong ghi chu
// phia tren.
export default async function ReviewSessionPage({
  params,
}: {
  params: Promise<{ reviewId: string }>;
}) {
  const { reviewId } = await params;
  const session = await auth();
  if (!session?.username) {
    return (
      <ElPageShell>
        <ElLoginPrompt />
      </ElPageShell>
    );
  }

  const data = await generateElReviewSessionAction(reviewId).catch(() => null);
  if (!data) {
    return (
      <ElPageShell>
        <ElErrorState message="Không tạo được phiên ôn tập này." />
      </ElPageShell>
    );
  }

  return (
    <ElPageShell wide>
      <h1 className="mb-1 text-[20px] font-bold text-ink">{data.title}</h1>
      <p className="mb-5 text-[12.5px] text-ink-muted">
        {data.mistakeCount > 0
          ? `${data.mistakeCount} câu bạn từng làm sai được ưu tiên ôn lại trước.`
          : "Không có câu nào bạn từng làm sai trong phạm vi ôn tập này."}
      </p>
      <ExerciseSession
        exercises={data.exercises}
        context="REVIEW"
        reviewId={data.reviewId}
        revealImmediately
        title={data.title}
        finishHref="/reviews"
        finishLabel="Quay lại danh sách ôn tập"
      />
    </ElPageShell>
  );
}
