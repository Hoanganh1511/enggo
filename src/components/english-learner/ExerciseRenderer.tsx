"use client";

// [2026-10-15] EXERCISE ENGINE - 1 component DUY NHAT render + thu thap dap
// an cho CA 6 loai bai (Multiple Choice/Gap Fill/Sentence Transformation/
// Error Correction/Matching/Word Formation). KHONG component nao khac tu
// cham diem - submit goi thang submitElAttemptAction (server action ->
// backend english-learner.service.ts, 1 noi DUY NHAT cham diem that). Day la
// ly do spec yeu cau "không viết logic chấm điểm riêng biệt trong từng màn
// hình bài tập".
//
// Luong tuong tac (spec muc 6): instruction -> prompt -> nhap/chon -> submit
// -> server cham -> hien dung/sai -> hien giai thich -> cho phep tiep tuc.
// KHONG tiet lo dap an truoc submit - exercise nhan vao (ElPublicExercise)
// von da KHONG chua answerConfig/explanation (backend loc truoc khi gui).

import { useState } from "react";
import { Check, Lightbulb, Loader2, X } from "lucide-react";
import { cn } from "@/lib/utils";
import type {
  ElAttemptContext,
  ElAttemptResult,
  ElPublicExercise,
  ElSubmittedAnswer,
} from "@/lib/english-learner/domain";
import { submitElAttemptAction } from "@/actions/english-learner/english-learner";

type Prompt = Record<string, unknown>;

export function ExerciseRenderer({
  exercise,
  context,
  reviewId,
  /** false (mac dinh "test" mode) = KHONG hien dung/sai/giai thich ngay sau
   *  submit, chi ghi nhan - dung cho Unit Test (spec: "Không tiết lộ đáp án
   *  trước khi submit trong chế độ kiểm tra" - o day mo rong them: ca SAU
   *  khi submit 1 cau, cac cau con lai van chua lo). true (practice/review
   *  mac dinh) = hien feedback NGAY. */
  revealImmediately = true,
  onAnswered,
}: {
  exercise: ElPublicExercise;
  context: ElAttemptContext;
  reviewId?: string;
  revealImmediately?: boolean;
  onAnswered?: (result: ElAttemptResult) => void;
}) {
  const [answer, setAnswer] = useState<ElSubmittedAnswer | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<ElAttemptResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [startedAt] = useState(() => Date.now());

  const answered = result !== null;
  const canSubmit = isAnswerComplete(exercise, answer);

  async function handleSubmit() {
    if (!canSubmit || !answer || submitting) return;
    setError(null);
    setSubmitting(true);
    try {
      const res = await submitElAttemptAction({
        exerciseId: exercise.id,
        submittedAnswer: answer,
        context,
        reviewId,
        durationMs: Date.now() - startedAt,
      });
      setResult(res);
      onAnswered?.(res);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Không nộp được câu trả lời. Thử lại.");
    } finally {
      setSubmitting(false);
    }
  }

  const showFeedback = answered && revealImmediately;

  return (
    <div className="flex flex-col gap-4">
      <p className="text-[13px] font-medium text-ink-muted">{exercise.instruction}</p>

      <AnswerInput
        exercise={exercise}
        value={answer}
        onChange={setAnswer}
        disabled={answered}
      />

      {exercise.hint && !answered && <HintToggle hint={exercise.hint} />}

      {error && <p className="text-[12.5px] text-danger">{error}</p>}

      {!answered && (
        <button
          type="button"
          onClick={handleSubmit}
          disabled={!canSubmit || submitting}
          className="flex h-10 w-fit cursor-pointer items-center gap-2 rounded-lg bg-primary px-5 text-[13px] font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
        >
          {submitting && <Loader2 size={14} className="animate-spin" aria-hidden="true" />}
          Nộp bài
        </button>
      )}

      {answered && !revealImmediately && (
        <p className="text-[12.5px] text-ink-muted">Đã ghi nhận câu trả lời.</p>
      )}

      {showFeedback && result && (
        <AnswerFeedback result={result} />
      )}
    </div>
  );
}

function HintToggle({ hint }: { hint: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-1.5 text-[12.5px] font-medium text-ink-muted hover:text-ink"
      >
        <Lightbulb size={14} aria-hidden="true" />
        {open ? "Ẩn gợi ý" : "Xem gợi ý"}
      </button>
      {open && <p className="mt-1.5 text-[12.5px] text-ink-muted italic">{hint}</p>}
    </div>
  );
}

function AnswerFeedback({ result }: { result: ElAttemptResult }) {
  return (
    <div
      className={cn(
        "flex flex-col gap-2 rounded-xl border p-4",
        result.isCorrect ? "border-success/30 bg-success/5" : "border-danger/30 bg-danger/5",
      )}
    >
      <span
        className={cn(
          "flex items-center gap-1.5 text-[13px] font-semibold",
          result.isCorrect ? "text-success" : "text-danger",
        )}
      >
        {result.isCorrect ? <Check size={16} aria-hidden="true" /> : <X size={16} aria-hidden="true" />}
        {result.isCorrect ? "Chính xác!" : "Chưa đúng"}
      </span>
      {!result.isCorrect && result.correctAnswerDisplay && (
        <p className="text-[12.5px] text-ink">
          <span className="font-medium">Đáp án đúng: </span>
          {result.correctAnswerDisplay}
        </p>
      )}
      {result.explanation && (
        <p className="text-[12.5px] leading-relaxed text-ink-muted">{result.explanation}</p>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Answer input - 1 nhanh / loai bai. `value`/`onChange` la ElSubmittedAnswer
// dung HINH DANG ma backend scoreExercise() mong doi cho dung `type` nay.
// ---------------------------------------------------------------------------

function isAnswerComplete(exercise: ElPublicExercise, answer: ElSubmittedAnswer | null): boolean {
  if (!answer) return false;
  switch (exercise.type) {
    case "MULTIPLE_CHOICE":
      return "selectedOptionId" in answer && answer.selectedOptionId !== "";
    case "GAP_FILL": {
      if (!("blanks" in answer)) return false;
      const segments = (exercise.prompt.segments ?? []) as { type: string; id?: string }[];
      const blankIds = segments.filter((s) => s.type === "blank").map((s) => s.id!);
      return blankIds.every((id) => (answer.blanks[id] ?? "").trim() !== "");
    }
    case "SENTENCE_TRANSFORMATION":
    case "ERROR_CORRECTION":
    case "WORD_FORMATION":
      return "text" in answer && answer.text.trim() !== "";
    case "MATCHING": {
      if (!("pairs" in answer)) return false;
      const leftItems = (exercise.prompt.leftItems ?? []) as { id: string }[];
      return leftItems.every((l) => Boolean(answer.pairs[l.id]));
    }
    default:
      return false;
  }
}

function AnswerInput({
  exercise,
  value,
  onChange,
  disabled,
}: {
  exercise: ElPublicExercise;
  value: ElSubmittedAnswer | null;
  onChange: (v: ElSubmittedAnswer) => void;
  disabled: boolean;
}) {
  const prompt = exercise.prompt as Prompt;
  // Hook phai goi VO DIEU KIEN (Rules of Hooks) - khai bao o day, KHONG
  // trong nhanh "MATCHING" cua switch ben duoi (cac loai bai khac khong
  // dung toi, nhung van phai ton tai o moi lan render cua component nay).
  const [activeLeft, setActiveLeft] = useState<string | null>(null);

  switch (exercise.type) {
    case "MULTIPLE_CHOICE": {
      const choices = ((exercise.options as Prompt)?.choices ?? []) as { id: string; text: string }[];
      const selected = value && "selectedOptionId" in value ? value.selectedOptionId : null;
      return (
        <div className="flex flex-col gap-2">
          <p className="font-content text-[15px] text-ink">{String(prompt.text ?? "")}</p>
          <div className="flex flex-col gap-2">
            {choices.map((c) => (
              <button
                key={c.id}
                type="button"
                disabled={disabled}
                onClick={() => onChange({ selectedOptionId: c.id })}
                className={cn(
                  "flex items-center gap-3 rounded-lg border px-4 py-2.5 text-left text-[13.5px] transition disabled:cursor-not-allowed",
                  selected === c.id
                    ? "border-primary bg-primary-soft text-primary"
                    : "border-border text-ink hover:border-ink-faint",
                )}
              >
                <span
                  className={cn(
                    "flex size-4 shrink-0 items-center justify-center rounded-full border-2",
                    selected === c.id ? "border-primary" : "border-border",
                  )}
                >
                  {selected === c.id && <span className="size-2 rounded-full bg-primary" />}
                </span>
                {c.text}
              </button>
            ))}
          </div>
        </div>
      );
    }

    case "GAP_FILL": {
      const segments = (prompt.segments ?? []) as { type: string; value?: string; id?: string }[];
      const blanks = value && "blanks" in value ? value.blanks : {};
      return (
        <p className="font-content flex flex-wrap items-center gap-1 text-[15px] leading-loose text-ink">
          {segments.map((seg, i) =>
            seg.type === "text" ? (
              <span key={i}>{seg.value}</span>
            ) : (
              <input
                key={seg.id ?? i}
                type="text"
                disabled={disabled}
                value={blanks[seg.id!] ?? ""}
                onChange={(e) => onChange({ blanks: { ...blanks, [seg.id!]: e.target.value } })}
                className="mx-1 w-40 rounded-md border border-border bg-surface px-2 py-1 text-[14px] text-ink outline-none focus:border-primary disabled:bg-surface-muted"
              />
            ),
          )}
        </p>
      );
    }

    case "SENTENCE_TRANSFORMATION": {
      const text = value && "text" in value ? value.text : "";
      return (
        <div className="flex flex-col gap-2">
          <p className="font-content text-[14px] text-ink">{String(prompt.original ?? "")}</p>
          {Boolean(prompt.keyword) && (
            <p className="text-[12.5px] text-ink-muted">
              Bắt đầu bằng: <span className="font-semibold text-ink">{String(prompt.keyword)}</span>
            </p>
          )}
          <input
            type="text"
            disabled={disabled}
            value={text}
            onChange={(e) => onChange({ text: e.target.value })}
            placeholder="Viết lại câu..."
            className="font-content rounded-lg border border-border bg-surface px-3.5 py-2.5 text-[14px] text-ink outline-none focus:border-primary disabled:bg-surface-muted"
          />
        </div>
      );
    }

    case "ERROR_CORRECTION": {
      const text = value && "text" in value ? value.text : "";
      return (
        <div className="flex flex-col gap-2">
          <p className="font-content rounded-lg bg-surface-muted px-3.5 py-2.5 text-[14px] text-ink">
            {String(prompt.sentence ?? "")}
          </p>
          <input
            type="text"
            disabled={disabled}
            value={text}
            onChange={(e) => onChange({ text: e.target.value })}
            placeholder="Viết lại câu đúng..."
            className="font-content rounded-lg border border-border bg-surface px-3.5 py-2.5 text-[14px] text-ink outline-none focus:border-primary disabled:bg-surface-muted"
          />
        </div>
      );
    }

    case "WORD_FORMATION": {
      const text = value && "text" in value ? value.text : "";
      return (
        <div className="flex flex-col gap-2">
          <p className="font-content text-[14px] text-ink">{String(prompt.sentence ?? "")}</p>
          <input
            type="text"
            disabled={disabled}
            value={text}
            onChange={(e) => onChange({ text: e.target.value })}
            placeholder="Nhập từ đã biến đổi..."
            className="font-content w-48 rounded-lg border border-border bg-surface px-3.5 py-2.5 text-[14px] text-ink outline-none focus:border-primary disabled:bg-surface-muted"
          />
        </div>
      );
    }

    case "MATCHING": {
      const leftItems = (prompt.leftItems ?? []) as { id: string; text: string }[];
      const rightItems = (prompt.rightItems ?? []) as { id: string; text: string }[];
      const pairs = value && "pairs" in value ? value.pairs : {};
      const usedRightIds = new Set(Object.values(pairs));

      return (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="flex flex-col gap-2">
            {leftItems.map((l) => (
              <button
                key={l.id}
                type="button"
                disabled={disabled}
                onClick={() => setActiveLeft(l.id)}
                className={cn(
                  "rounded-lg border px-3.5 py-2.5 text-left text-[13.5px] transition disabled:cursor-not-allowed",
                  activeLeft === l.id
                    ? "border-primary bg-primary-soft text-primary"
                    : pairs[l.id]
                      ? "border-success/40 bg-success/5 text-ink"
                      : "border-border text-ink hover:border-ink-faint",
                )}
              >
                {l.text}
                {pairs[l.id] && (
                  <span className="ml-2 text-[11.5px] text-ink-muted">
                    → {rightItems.find((r) => r.id === pairs[l.id])?.text}
                  </span>
                )}
              </button>
            ))}
          </div>
          <div className="flex flex-col gap-2">
            {rightItems.map((r) => (
              <button
                key={r.id}
                type="button"
                disabled={disabled || !activeLeft}
                onClick={() => {
                  if (!activeLeft) return;
                  onChange({ pairs: { ...pairs, [activeLeft]: r.id } });
                  setActiveLeft(null);
                }}
                className={cn(
                  "rounded-lg border px-3.5 py-2.5 text-left text-[13.5px] transition disabled:cursor-not-allowed disabled:opacity-50",
                  usedRightIds.has(r.id)
                    ? "border-success/40 bg-success/5 text-ink"
                    : "border-border text-ink hover:border-ink-faint",
                )}
              >
                {r.text}
              </button>
            ))}
          </div>
        </div>
      );
    }

    default:
      return null;
  }
}
