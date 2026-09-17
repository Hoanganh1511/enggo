"use client";

import { useMemo, useState } from "react";
import { Search, ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";

type DictionaryTerm = { term: string; description: string };
type DictionarySection = { id: string; title: string; terms: DictionaryTerm[] };

// [2026-09-17] "Guides > Dictionary" - yeu cau nguoi dung: "bổ sung thêm 1
// cate Guides ngay tiếp theo dưới Explore, trong này sẽ có 1 page mặc định
// là: Dictionary. Tạm thời cứ thiết kế trước layout như trong ảnh cho nó."
// Day CHI la khung LAYOUT (du lieu mau tinh, chua noi voi contentMarkdown
// that cua Entry) - dung tinh than "thiết kế trước layout" nguoi dung yeu
// cau, danh gia noi dung/nguon du lieu that cho ban sau. Sections KHAC "The
// Model" chua co noi dung that (chi hien placeholder khi bam vao) - so
// luong hien trong SECTIONS la GIA TRI MUC TIEU tham khao tu mockup, khong
// phai items.length (khac quy uoc "tu tinh" da ap dung cho Accordion
// Geographical, vi cac section nay CHUA co du lieu that de tinh).
const SECTIONS: DictionarySection[] = [
  {
    id: "the-model",
    title: "The Model",
    terms: [
      {
        term: "AI",
        description:
          "A moving label, not a technology. Points at whatever computers can newly, impressively do — right now, large language models.",
      },
      {
        term: "Model",
        description:
          "The parameters. Stateless — does next-token prediction and nothing else. Cannot do anything agentic on its own.",
      },
      {
        term: "Parameters",
        description:
          "The numbers inside a model — often billions — tuned during training. Everything the model knows lives in them. Also called weights.",
      },
      {
        term: "Training",
        description:
          "The process that sets a model's parameters by exposing it to vast amounts of text and adjusting to improve next-token prediction.",
      },
      {
        term: "Inference",
        description:
          "Running a trained model to generate output — what happens on every model provider request. Parameters stay fixed.",
      },
      {
        term: "Effort",
        description:
          "A dial for how much reasoning the model does before it answers. More effort spends more output tokens for a better shot at hard problems.",
      },
      {
        term: "Token",
        description:
          "The atomic unit a model reads and writes. Roughly word-sized but not exactly. Context window size, cost, and latency all count tokens.",
      },
      {
        term: "Next-token prediction",
        description:
          "What the model actually does. Samples one next token from the context, appends it, and runs again. Its only mode of operation.",
      },
      {
        term: "Non-determinism",
        description:
          "The same input can produce different output. A property of how models generate text and how providers serve requests.",
      },
      {
        term: "Model provider",
        description:
          "Whatever serves a model for inference. Usually remote (Anthropic, OpenAI, Google), but can also be local (Ollama, llama.cpp).",
      },
      {
        term: "Harness",
        description:
          "Everything around the model that turns it into an agent: tools, system prompt, context-window management, permissions, hooks.",
      },
      {
        term: "Model provider request",
        description: "One round-trip from the harness to the model provider. The harness sends context; the provider returns one response.",
      },
      {
        term: "Input tokens",
        description: "Everything sent to the model provider in a request — system prompt, history, tool results.",
      },
      {
        term: "Output tokens",
        description: "Everything the model generates in a response — the reply text, plus any tool calls.",
      },
    ],
  },
  { id: "sessions", title: "Sessions, Context Windows & Compaction", terms: [] },
  { id: "tools-environment", title: "Tools & Environment", terms: [] },
  { id: "failure-modes", title: "Failure Modes", terms: [] },
  { id: "handoffs", title: "Handoffs", terms: [] },
  { id: "memory-steering", title: "Memory and Steering", terms: [] },
  { id: "patterns-of-work", title: "Patterns of Work", terms: [] },
];

// So luong hien canh moi section trong SECTIONS - gia tri MUC TIEU tu
// mockup (xem comment dau file), rieng "the-model" moi la con so THAT
// (SECTIONS[0].terms.length).
const SECTION_TARGET_COUNT: Record<string, number> = {
  "the-model": SECTIONS[0].terms.length,
  sessions: 8,
  "tools-environment": 10,
  "failure-modes": 9,
  handoffs: 9,
  "memory-steering": 6,
  "patterns-of-work": 11,
};

export function SeriesDictionaryView() {
  const [query, setQuery] = useState("");
  const [activeSectionId, setActiveSectionId] = useState(SECTIONS[0].id);

  const activeSection = SECTIONS.find((s) => s.id === activeSectionId) ?? SECTIONS[0];

  const filteredTerms = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return activeSection.terms;
    return activeSection.terms.filter(
      (t) => t.term.toLowerCase().includes(q) || t.description.toLowerCase().includes(q),
    );
  }, [activeSection, query]);

  return (
    <div className="font-content -mx-6 -my-6 flex min-h-[calc(100vh-var(--header-height))] lg:-mx-10">
      {/* Sidebar trai - search + danh sach SECTIONS (co so luong) - khop
          mockup nguoi dung gui. sticky theo chieu cao view rieng cua trang
          nay (khong dung chung sticky cua DocsToc, day la 1 kieu dieu huong
          KHAC - chon 1 nhom de loc, khong phai nhay anchor). */}
      <aside className="hidden w-64 shrink-0 flex-col gap-4 border-r border-border bg-surface-muted/40 p-5 sm:flex">
        <div className="flex items-center gap-2 rounded-lg border border-border bg-surface px-3 py-2">
          <Search size={14} strokeWidth={2} className="shrink-0 text-ink-faint" aria-hidden="true" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search the dictionary..."
            className="min-w-0 flex-1 bg-transparent font-mono text-[13px] text-ink outline-none placeholder:text-ink-faint"
          />
        </div>

        <div>
          <p className="mb-1.5 px-1 text-[11px] font-semibold tracking-wide text-ink-faint uppercase">
            Sections
          </p>
          <nav className="flex flex-col gap-0.5">
            {SECTIONS.map((section) => (
              <button
                key={section.id}
                type="button"
                onClick={() => {
                  setActiveSectionId(section.id);
                  setQuery("");
                }}
                className={cn(
                  "flex w-full cursor-pointer items-center justify-between gap-2 rounded-md px-2.5 py-1.5 text-left text-[13.5px] transition-colors duration-150 ease-out",
                  section.id === activeSectionId
                    ? "bg-surface font-semibold text-ink shadow-sm"
                    : "text-ink-muted hover:bg-hover-bg hover:text-ink",
                )}
              >
                <span className="flex items-center gap-1.5">
                  <span className="text-ink-faint">#</span>
                  {section.title}
                </span>
                <span className="shrink-0 font-mono text-[11px] text-ink-faint">
                  {SECTION_TARGET_COUNT[section.id]}
                </span>
              </button>
            ))}
          </nav>
        </div>
      </aside>

      {/* Luoi thuat ngu 2 cot - moi the: tieu de + mui ten (trang tri, chua
          gan link that vi day chi la khung layout) + mo ta. */}
      <div className="min-w-0 flex-1 p-6 lg:p-8">
        {filteredTerms.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center gap-2 py-20 text-center">
            <p className="text-[15px] font-semibold text-ink">
              {activeSection.terms.length === 0 ? "Nội dung đang được biên soạn" : "Không tìm thấy thuật ngữ nào"}
            </p>
            <p className="max-w-sm text-[13px] text-ink-faint">
              {activeSection.terms.length === 0
                ? `Phần "${activeSection.title}" sẽ sớm được bổ sung.`
                : "Thử một từ khoá khác."}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-x-8 gap-y-6 sm:grid-cols-2">
            {filteredTerms.map((item) => (
              <div key={item.term}>
                <div className="flex items-start justify-between gap-2">
                  <p className="text-[15px] font-bold text-ink">{item.term}</p>
                  <ArrowUpRight size={15} strokeWidth={2} className="mt-0.5 shrink-0 text-ink-faint" aria-hidden="true" />
                </div>
                <p className="mt-1 text-[13.5px] text-ink-muted">{item.description}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
