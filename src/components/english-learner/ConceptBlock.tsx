"use client";

// [2026-10-15] 1 Concept = 1 khoi noi dung day du (spec muc 9 "Components":
// ConceptBlock/GrammarFormula/ExampleBlock/VocabularyCard/CollocationList/
// WordFamilyTree gop chung trong 1 file vi deu nho va LUON di cung nhau -
// tach 6 file rieng cho 6 mieng UI nho se vo tinh pham "không viết tất cả
// code trong một file" theo chieu NGUOC lai (qua nhieu file cho 1 khai niem).
// Grammar/Vocabulary dung CHUNG 1 component nay (khong co ConceptBlockGrammar/
// ConceptBlockVocabulary rieng) - spec muc 2.4 "Không hardcode mỗi Unit...",
// ap dung tuong tu cho Concept: nhanh theo `concept.type`, khong nhan rieng
// component.

import { useState } from "react";
import { AlertTriangle, ChevronDown, Lightbulb, Volume2 } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ElConcept, ElVocabularyItem } from "@/lib/english-learner/domain";
import { ExerciseRenderer } from "./ExerciseRenderer";

export function ConceptBlock({ concept }: { concept: ElConcept }) {
  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-border bg-surface p-5">
      <h3 className="font-content text-[16px] font-bold text-ink">{concept.title}</h3>

      {concept.explanation && (
        <p className="font-content text-[13.5px] leading-relaxed text-ink">
          {concept.explanation}
        </p>
      )}

      {concept.formula && <GrammarFormula formula={concept.formula} />}

      {concept.examples && concept.examples.length > 0 && (
        <div className="flex flex-col gap-1.5">
          {concept.examples.map((ex, i) => (
            <ExampleLine key={i} en={ex.en} vi={ex.vi} negative={ex.isNegative} />
          ))}
        </div>
      )}

      {concept.commonMistakes && concept.commonMistakes.length > 0 && (
        <NoteBlock
          icon={AlertTriangle}
          tone="warning"
          title="Lỗi thường gặp"
          notes={concept.commonMistakes}
        />
      )}

      {concept.usageNotes && concept.usageNotes.length > 0 && (
        <NoteBlock icon={Lightbulb} tone="info" title="Lưu ý" notes={concept.usageNotes} />
      )}

      {concept.vocabularyItems.length > 0 && (
        <div className="flex flex-col gap-3">
          {concept.vocabularyItems.map((v) => (
            <VocabularyCard key={v.id} item={v} />
          ))}
        </div>
      )}

      {concept.exercises.length > 0 && (
        <div className="flex flex-col gap-3 border-t border-border pt-4">
          <p className="text-[12px] font-semibold tracking-wide text-ink-muted uppercase">
            Luyện tập nhanh
          </p>
          {concept.exercises.map((ex) => (
            <div key={ex.id} className="rounded-xl bg-surface-muted p-4">
              <ExerciseRenderer exercise={ex} context="PRACTICE" />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export function GrammarFormula({ formula }: { formula: string }) {
  return (
    <div className="rounded-lg bg-surface-muted px-4 py-2.5">
      <code className="font-content text-[13.5px] font-semibold text-ink">{formula}</code>
    </div>
  );
}

export function ExampleLine({
  en,
  vi,
  negative,
}: {
  en: string;
  vi: string;
  negative?: boolean;
}) {
  return (
    <div className="flex items-start gap-2 border-l-2 border-primary/30 pl-3">
      <div className="min-w-0">
        <p className="font-content text-[13.5px] text-ink">
          {negative && <span className="mr-1 text-danger">✕</span>}
          {en}
        </p>
        <p className="text-[12px] text-ink-muted">{vi}</p>
      </div>
    </div>
  );
}

function NoteBlock({
  icon: Icon,
  tone,
  title,
  notes,
}: {
  icon: React.ComponentType<{ size?: number; className?: string }>;
  tone: "warning" | "info";
  title: string;
  notes: { title: string; note: string }[];
}) {
  return (
    <div
      className={cn(
        "flex flex-col gap-2 rounded-lg p-3.5",
        tone === "warning" ? "bg-warning/8" : "bg-primary-soft",
      )}
    >
      <span
        className={cn(
          "flex items-center gap-1.5 text-[12px] font-semibold",
          tone === "warning" ? "text-warning" : "text-primary",
        )}
      >
        <Icon size={13} aria-hidden="true" />
        {title}
      </span>
      {notes.map((n, i) => (
        <p key={i} className="text-[12.5px] leading-relaxed text-ink">
          <span className="font-medium">{n.title}: </span>
          {n.note}
        </p>
      ))}
    </div>
  );
}

export function VocabularyCard({ item }: { item: ElVocabularyItem }) {
  const [expanded, setExpanded] = useState(false);
  const hasExtra =
    item.collocations.length > 0 ||
    item.wordPatterns.length > 0 ||
    (item.wordFamily?.length ?? 0) > 0 ||
    item.confusableTerms.length > 0;

  return (
    <div className="rounded-xl border border-border p-4">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <span className="flex items-center gap-2">
            <span className="font-content text-[14.5px] font-bold text-ink">{item.term}</span>
            {item.partOfSpeech && (
              <span className="text-[11px] text-ink-muted italic">{item.partOfSpeech}</span>
            )}
            {item.ipa && (
              <span className="flex items-center gap-1 text-[11.5px] text-ink-muted">
                <Volume2 size={11} aria-hidden="true" />
                {item.ipa}
              </span>
            )}
          </span>
          <p className="mt-0.5 text-[13px] text-ink">{item.meaningVi}</p>
          {item.definitionEn && (
            <p className="mt-0.5 text-[11.5px] text-ink-muted italic">{item.definitionEn}</p>
          )}
        </div>
      </div>

      {item.examples && item.examples.length > 0 && (
        <div className="mt-2 flex flex-col gap-1">
          {item.examples.map((ex, i) => (
            <p key={i} className="font-content text-[12.5px] text-ink-muted">
              <span className="text-ink">{ex.en}</span> — {ex.vi}
            </p>
          ))}
        </div>
      )}

      {hasExtra && (
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          className="mt-2 flex items-center gap-1 text-[11.5px] font-medium text-primary hover:underline"
        >
          <ChevronDown
            size={12}
            className={cn("transition-transform", expanded && "rotate-180")}
            aria-hidden="true"
          />
          {expanded ? "Ẩn chi tiết" : "Xem thêm"}
        </button>
      )}

      {expanded && (
        <div className="mt-2 flex flex-col gap-2 border-t border-border pt-2.5">
          {item.collocations.length > 0 && (
            <CollocationList label="Collocation" items={item.collocations} />
          )}
          {item.wordPatterns.length > 0 && (
            <CollocationList label="Word pattern" items={item.wordPatterns} />
          )}
          {item.wordFamily && item.wordFamily.length > 0 && (
            <WordFamilyTree entries={item.wordFamily} />
          )}
          {item.confusableTerms.length > 0 && (
            <p className="text-[11.5px] text-ink-muted">
              <span className="font-medium">Dễ nhầm với: </span>
              {item.confusableTerms.join(", ")}
            </p>
          )}
        </div>
      )}
    </div>
  );
}

export function CollocationList({ label, items }: { label: string; items: string[] }) {
  return (
    <div className="flex flex-wrap items-center gap-1.5">
      <span className="text-[11px] font-semibold text-ink-muted">{label}:</span>
      {items.map((c) => (
        <span
          key={c}
          className="rounded-full bg-surface-muted px-2 py-0.5 text-[11.5px] text-ink"
        >
          {c}
        </span>
      ))}
    </div>
  );
}

export function WordFamilyTree({
  entries,
}: {
  entries: { word: string; partOfSpeech?: string }[];
}) {
  return (
    <div className="flex flex-wrap items-center gap-1.5">
      <span className="text-[11px] font-semibold text-ink-muted">Word family:</span>
      {entries.map((e) => (
        <span key={e.word} className="text-[11.5px] text-ink">
          {e.word}
          {e.partOfSpeech && <span className="text-ink-muted"> ({e.partOfSpeech})</span>}
        </span>
      ))}
    </div>
  );
}
