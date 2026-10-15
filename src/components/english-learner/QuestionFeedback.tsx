"use client";

import type { ApiEnglishAnswerResult, ApiEnglishPublicQuestion } from "@/lib/api/english-learner";

export function QuestionFeedback({
  question,
  result,
  onContinue,
}: {
  question: ApiEnglishPublicQuestion;
  result: ApiEnglishAnswerResult;
  onContinue: () => void;
}) {
  return (
    <div
      className={`rounded-xl border p-6 ${
        result.isCorrect
          ? "border-[var(--border)] bg-[var(--surface)]"
          : "border-[var(--border)] bg-[var(--surface-muted)]"
      }`}
    >
      <div className="text-sm font-semibold text-[var(--ink)]">
        {result.isCorrect ? "Chính xác!" : "Chưa đúng"}
      </div>
      <p className="mt-2 text-sm text-[var(--ink)]">{result.explanation}</p>

      {!result.isCorrect && (
        <ul className="mt-3 flex flex-col gap-1 text-sm text-[var(--ink-muted)]">
          {question.options
            .filter((o) => o.id !== result.correctOptionId)
            .map((o) => {
              const explanation = result.distractorExplanations[o.id];
              if (!explanation) return null;
              return <li key={o.id}>· {explanation}</li>;
            })}
        </ul>
      )}

      {result.belowMinTime && (
        <p className="mt-3 text-xs text-[var(--ink-muted)]">
          Bạn trả lời quá nhanh - câu này không được tính vào kết quả xác minh.
        </p>
      )}

      <button
        type="button"
        onClick={onContinue}
        className="mt-4 inline-flex items-center justify-center rounded-lg bg-[var(--ink)] px-4 py-2 text-sm font-medium text-[var(--surface)] hover:opacity-90"
      >
        Tiếp tục
      </button>
    </div>
  );
}
