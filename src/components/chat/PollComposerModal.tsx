"use client";

import { useState } from "react";
import { Plus, X } from "lucide-react";
import { SimpleModal } from "@/components/ui/simple-modal";

export function PollComposerModal({
  open,
  onOpenChange,
  onSubmit,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (poll: {
    question: string;
    options: { text: string }[];
  }) => Promise<void>;
}) {
  const [question, setQuestion] = useState("");
  const [options, setOptions] = useState(["", ""]);
  const [submitting, setSubmitting] = useState(false);

  function reset() {
    setQuestion("");
    setOptions(["", ""]);
  }

  function updateOption(index: number, value: string) {
    setOptions((prev) => prev.map((o, i) => (i === index ? value : o)));
  }

  function removeOption(index: number) {
    setOptions((prev) => prev.filter((_, i) => i !== index));
  }

  const trimmedOptions = options.map((o) => o.trim()).filter(Boolean);
  const canSubmit =
    question.trim().length > 0 && trimmedOptions.length >= 2 && !submitting;

  async function handleSubmit() {
    if (!canSubmit) return;
    setSubmitting(true);
    try {
      await onSubmit({
        question: question.trim(),
        options: trimmedOptions.map((text) => ({ text })),
      });
      reset();
      onOpenChange(false);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <SimpleModal
      open={open}
      onOpenChange={(next) => {
        if (!next) reset();
        onOpenChange(next);
      }}
      title="Tạo bình chọn"
      description="Người nhận có thể chọn 1 phương án."
      footer={
        <button
          type="button"
          onClick={() => void handleSubmit()}
          disabled={!canSubmit}
          className="w-full cursor-pointer rounded-xl px-4 py-2.5 text-sm font-semibold text-white transition-opacity duration-150 ease-out disabled:cursor-not-allowed disabled:opacity-50"
          style={{ background: "var(--primary)" }}
        >
          {submitting ? "Đang tạo..." : "Tạo bình chọn"}
        </button>
      }
    >
      <div className="flex flex-col gap-4">
        <div>
          <label className="mb-1.5 block text-xs font-semibold text-ink-muted">
            Câu hỏi
          </label>
          <input
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            maxLength={200}
            placeholder="Bạn muốn hỏi gì?"
            className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-ink outline-none focus:border-primary"
          />
        </div>

        <div>
          <label className="mb-1.5 block text-xs font-semibold text-ink-muted">
            Các lựa chọn
          </label>
          <div className="flex flex-col gap-2">
            {options.map((option, index) => (
              <div key={index} className="flex items-center gap-1.5">
                <input
                  value={option}
                  onChange={(e) => updateOption(index, e.target.value)}
                  maxLength={80}
                  placeholder={`Lựa chọn ${index + 1}`}
                  className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-ink outline-none focus:border-primary"
                />
                {options.length > 2 && (
                  <button
                    type="button"
                    onClick={() => removeOption(index)}
                    aria-label="Xoá lựa chọn"
                    className="flex size-8 shrink-0 cursor-pointer items-center justify-center rounded-lg text-ink-faint hover:bg-hover-bg hover:text-ink"
                  >
                    <X size={14} />
                  </button>
                )}
              </div>
            ))}
          </div>
          {options.length < 10 && (
            <button
              type="button"
              onClick={() => setOptions((prev) => [...prev, ""])}
              className="mt-2 flex cursor-pointer items-center gap-1.5 text-xs font-semibold text-primary"
            >
              <Plus size={14} /> Thêm lựa chọn
            </button>
          )}
        </div>
      </div>
    </SimpleModal>
  );
}
