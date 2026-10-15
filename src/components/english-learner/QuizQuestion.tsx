"use client";

import type { ApiEnglishPublicQuestion } from "@/lib/api/english-learner";

const TYPE_LABEL: Record<ApiEnglishPublicQuestion["questionType"], string> = {
  RECOGNITION: "Nhận diện",
  APPLICATION: "Vận dụng",
  ERROR_DETECTION: "Phát hiện lỗi",
};

export function QuizQuestion({
  question,
  index,
  total,
  elapsedSeconds,
  canSubmit,
  selectedOptionId,
  onSelect,
  onSubmit,
}: {
  question: ApiEnglishPublicQuestion;
  index: number;
  total: number;
  elapsedSeconds: number;
  canSubmit: boolean;
  selectedOptionId: string | null;
  onSelect: (optionId: string) => void;
  onSubmit: () => void;
}) {
  return (
    <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-6">
      <div className="flex items-center justify-between text-xs text-[var(--ink-muted)]">
        <span>
          Câu {index + 1}/{total} · {TYPE_LABEL[question.questionType]}
          {question.isRetentionQuestion ? " · Ôn lại" : ""}
        </span>
        <span>{elapsedSeconds}s</span>
      </div>

      <p className="mt-4 font-content text-base text-[var(--ink)]">{question.stem}</p>

      <div className="mt-4 flex flex-col gap-2">
        {question.options.map((option) => {
          const selected = option.id === selectedOptionId;
          return (
            <button
              key={option.id}
              type="button"
              onClick={() => onSelect(option.id)}
              className={`rounded-lg border px-4 py-3 text-left text-sm transition-colors ${
                selected
                  ? "border-[var(--ink)] bg-[var(--surface-muted)] text-[var(--ink)]"
                  : "border-[var(--border)] text-[var(--ink)] hover:bg-[var(--surface-muted)]"
              }`}
            >
              {option.text}
            </button>
          );
        })}
      </div>

      <button
        type="button"
        disabled={!canSubmit || !selectedOptionId}
        onClick={onSubmit}
        className="mt-4 inline-flex items-center justify-center rounded-lg bg-[var(--ink)] px-4 py-2 text-sm font-medium text-[var(--surface)] disabled:cursor-not-allowed disabled:opacity-40"
      >
        {canSubmit ? "Trả lời" : `Chờ ${question.minTimeSeconds - elapsedSeconds}s...`}
      </button>
    </div>
  );
}
