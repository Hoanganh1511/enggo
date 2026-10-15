"use client";

import Link from "next/link";
import type { ApiEnglishCompleteResult } from "@/lib/api/english-learner";

const RESULT_LABEL: Record<ApiEnglishCompleteResult["resultStatus"], string> = {
  NEW_KNOWLEDGE_VERIFIED: "Đã xác minh kiến thức mới",
  NEW_KNOWLEDGE_DEVELOPING: "Đang hình thành kiến thức",
  REVIEW_ONLY: "Củng cố kiến thức cũ",
  NEEDS_REINFORCEMENT: "Cần học lại",
  NO_ASSESSMENT: "Chưa có bằng chứng",
};

export function SessionResult({ result }: { result: ApiEnglishCompleteResult }) {
  return (
    <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-6">
      <div className="text-sm font-semibold text-[var(--ink)]">
        {RESULT_LABEL[result.resultStatus]}
      </div>
      <p className="mt-2 text-sm text-[var(--ink)]">{result.recommendation}</p>

      {result.flagSuspicious && (
        <p className="mt-3 text-xs text-[var(--ink-muted)]">
          Một số câu trả lời quá nhanh bất thường - kết quả hôm nay có thể không chính xác.
        </p>
      )}

      <Link
        href="/english-learner"
        className="mt-4 inline-flex items-center justify-center rounded-lg bg-[var(--ink)] px-4 py-2 text-sm font-medium text-[var(--surface)] hover:opacity-90"
      >
        Về trang hôm nay
      </Link>
    </div>
  );
}
