"use client";

// [2026-10-15] Dieu phoi 1 PHIEN lam bai (Practice/Unit Test/Review deu dung
// CHUNG component nay, chi khac `exercises`/`context`/`revealImmediately`
// truyen vao) - tien do cau hoi, Previous/Next, man hinh tong ket cuoi phien.
// KHONG tu cham diem - chi gom ket qua ExerciseRenderer da tra ve.

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, ArrowRight, Check, RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ElAttemptContext, ElAttemptResult, ElPublicExercise } from "@/lib/english-learner/domain";
import { ExerciseRenderer } from "./ExerciseRenderer";

export function ExerciseSession({
  exercises,
  context,
  reviewId,
  revealImmediately = true,
  title,
  finishHref,
  finishLabel = "Quay lại",
}: {
  exercises: ElPublicExercise[];
  context: ElAttemptContext;
  reviewId?: string;
  revealImmediately?: boolean;
  title: string;
  finishHref: string;
  finishLabel?: string;
}) {
  const [index, setIndex] = useState(0);
  const [results, setResults] = useState<Record<string, ElAttemptResult>>({});
  const [finished, setFinished] = useState(false);

  if (exercises.length === 0) {
    return (
      <div className="rounded-xl border border-border bg-surface p-8 text-center">
        <p className="text-[14px] text-ink-muted">Chưa có bài tập nào ở đây.</p>
      </div>
    );
  }

  const current = exercises[index];
  const answeredCount = Object.keys(results).length;
  const isLast = index === exercises.length - 1;

  function handleAnswered(result: ElAttemptResult) {
    setResults((prev) => ({ ...prev, [current.id]: result }));
  }

  if (finished) {
    const correctCount = Object.values(results).filter((r) => r.isCorrect).length;
    const wrongExercises = exercises.filter((e) => results[e.id] && !results[e.id].isCorrect);
    return (
      <div className="flex flex-col gap-5">
        <div className="rounded-2xl border border-border bg-surface p-6 text-center">
          <p className="text-[13px] font-medium text-ink-muted">Kết quả</p>
          <p className="mt-1 text-[32px] font-bold text-ink">
            {correctCount}/{exercises.length}
          </p>
          <p className="mt-1 text-[13px] text-ink-muted">câu trả lời đúng</p>
        </div>

        {wrongExercises.length > 0 && (
          <div className="flex flex-col gap-2">
            <p className="text-[13px] font-semibold text-ink">Câu cần xem lại</p>
            {wrongExercises.map((e) => (
              <div key={e.id} className="rounded-lg border border-danger/30 bg-danger/5 p-3">
                <p className="text-[12.5px] text-ink">{e.instruction}</p>
                {results[e.id]?.correctAnswerDisplay && (
                  <p className="mt-1 text-[12px] text-ink-muted">
                    Đáp án đúng: {results[e.id].correctAnswerDisplay}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}

        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => {
              setIndex(0);
              setResults({});
              setFinished(false);
            }}
            className="flex h-10 cursor-pointer items-center gap-1.5 rounded-lg border border-border px-4 text-[13px] font-medium text-ink hover:bg-surface-muted"
          >
            <RotateCcw size={14} aria-hidden="true" />
            Làm lại
          </button>
          <Link
            href={finishHref}
            className="flex h-10 cursor-pointer items-center rounded-lg bg-primary px-4 text-[13px] font-semibold text-white hover:opacity-90"
          >
            {finishLabel}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <p className="text-[13px] font-semibold text-ink">{title}</p>
          <p className="text-[12.5px] text-ink-muted">
            Câu {index + 1}/{exercises.length}
          </p>
        </div>
        <div className="flex gap-1">
          {exercises.map((e, i) => {
            const r = results[e.id];
            return (
              <span
                key={e.id}
                className={cn(
                  "h-1.5 flex-1 rounded-full transition-colors",
                  i === index
                    ? "bg-primary"
                    : r
                      ? r.isCorrect
                        ? "bg-success"
                        : "bg-danger"
                      : "bg-border",
                )}
              />
            );
          })}
        </div>
      </div>

      <div className="rounded-2xl border border-border bg-surface p-6">
        <ExerciseRenderer
          key={current.id}
          exercise={current}
          context={context}
          reviewId={reviewId}
          revealImmediately={revealImmediately}
          onAnswered={handleAnswered}
        />
      </div>

      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => setIndex((i) => Math.max(0, i - 1))}
          disabled={index === 0}
          className="flex h-9 cursor-pointer items-center gap-1.5 rounded-lg border border-border px-3.5 text-[12.5px] font-medium text-ink hover:bg-surface-muted disabled:cursor-not-allowed disabled:opacity-40"
        >
          <ArrowLeft size={14} aria-hidden="true" />
          Trước
        </button>

        {isLast ? (
          <button
            type="button"
            onClick={() => setFinished(true)}
            disabled={!results[current.id]}
            className="flex h-9 cursor-pointer items-center gap-1.5 rounded-lg bg-primary px-4 text-[12.5px] font-semibold text-white hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <Check size={14} aria-hidden="true" />
            Hoàn thành ({answeredCount}/{exercises.length})
          </button>
        ) : (
          <button
            type="button"
            onClick={() => setIndex((i) => Math.min(exercises.length - 1, i + 1))}
            disabled={!results[current.id]}
            className="flex h-9 cursor-pointer items-center gap-1.5 rounded-lg border border-border px-3.5 text-[12.5px] font-medium text-ink hover:bg-surface-muted disabled:cursor-not-allowed disabled:opacity-40"
          >
            Tiếp
            <ArrowRight size={14} aria-hidden="true" />
          </button>
        )}
      </div>
    </div>
  );
}
