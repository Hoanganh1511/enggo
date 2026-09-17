"use client";

import { Plus, Trash2 } from "lucide-react";
import type { DictionarySection, DictionaryTerm } from "@/lib/api/content-series";

const inputClass =
  "w-full rounded-lg border border-border bg-surface px-3 py-2 text-[13px] outline-none focus:border-primary";

function randomId(): string {
  return typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : Math.random().toString(36).slice(2);
}

// Form soan layout "Dictionary" (search + sidebar Sections + luoi thuat ngu
// 2 cot, xem SeriesDictionaryView.tsx) - yeu cau nguoi dung: "bổ sung thêm 1
// cate Guides... trong này sẽ có 1 page mặc định là: Dictionary" roi "Làm
// đi" (chuyen du lieu tinh hardcode sang DB-backed, sua duoc qua admin UI
// nay). Cau truc long 2 cap (section chua terms) nen tu viet state thay vi
// dung RepeaterField (von chi phuc vu mang PHANG 1 cap).
export function DictionarySectionsEditor({
  sections,
  onChange,
}: {
  sections: DictionarySection[];
  onChange: (sections: DictionarySection[]) => void;
}) {
  function updateSection(index: number, patch: Partial<DictionarySection>) {
    onChange(sections.map((s, i) => (i === index ? { ...s, ...patch } : s)));
  }
  function addSection() {
    onChange([...sections, { id: randomId(), title: "", terms: [] }]);
  }
  function removeSection(index: number) {
    onChange(sections.filter((_, i) => i !== index));
  }

  function updateTerm(sectionIndex: number, termIndex: number, patch: Partial<DictionaryTerm>) {
    const section = sections[sectionIndex];
    updateSection(sectionIndex, {
      terms: section.terms.map((t, i) => (i === termIndex ? { ...t, ...patch } : t)),
    });
  }
  function addTerm(sectionIndex: number) {
    const section = sections[sectionIndex];
    updateSection(sectionIndex, { terms: [...section.terms, { term: "", description: "" }] });
  }
  function removeTerm(sectionIndex: number, termIndex: number) {
    const section = sections[sectionIndex];
    updateSection(sectionIndex, { terms: section.terms.filter((_, i) => i !== termIndex) });
  }

  return (
    <div className="flex flex-col gap-3">
      {sections.map((section, sectionIndex) => (
        <div key={section.id} className="rounded-lg border border-border p-3">
          <div className="flex items-center gap-2">
            <input
              value={section.title}
              onChange={(e) => updateSection(sectionIndex, { title: e.target.value })}
              placeholder="Tên section (vd: The Model)"
              className={`${inputClass} flex-1 font-semibold`}
            />
            <button
              type="button"
              onClick={() => removeSection(sectionIndex)}
              aria-label="Xoá section"
              className="flex size-8 shrink-0 cursor-pointer items-center justify-center rounded-md text-ink-faint hover:bg-danger/10 hover:text-danger"
            >
              <Trash2 size={14} strokeWidth={2} />
            </button>
          </div>

          <div className="mt-2.5 flex flex-col gap-2 border-t border-border pt-2.5">
            {section.terms.map((term, termIndex) => (
              <div key={termIndex} className="rounded-md border border-border/60 p-2">
                <div className="flex items-center gap-2">
                  <input
                    value={term.term}
                    onChange={(e) => updateTerm(sectionIndex, termIndex, { term: e.target.value })}
                    placeholder="Thuật ngữ"
                    className={`${inputClass} flex-1`}
                  />
                  <button
                    type="button"
                    onClick={() => removeTerm(sectionIndex, termIndex)}
                    aria-label="Xoá thuật ngữ"
                    className="flex size-7 shrink-0 cursor-pointer items-center justify-center rounded-md text-ink-faint hover:bg-danger/10 hover:text-danger"
                  >
                    <Trash2 size={13} strokeWidth={2} />
                  </button>
                </div>
                <textarea
                  value={term.description}
                  onChange={(e) => updateTerm(sectionIndex, termIndex, { description: e.target.value })}
                  placeholder="Mô tả ngắn"
                  rows={2}
                  className={`${inputClass} mt-1.5 resize-y`}
                />
                {/* href KHONG bat buoc - yeu cau nguoi dung: "ví dụ tôi có
                    những từ cần bài viết giải thích chi tiết thì có thể viết
                    những bài cho concept đấy ở Dictionary được?" - de trong
                    thi mui ten chi la trang tri, dien 1 duong dan (thuong toi
                    1 Entry khac, vd /series/<slug>/<entrySlug>) thi thuat ngu
                    tro thanh link bam duoc toi bai giai thich rieng do. */}
                <input
                  value={term.href ?? ""}
                  onChange={(e) => updateTerm(sectionIndex, termIndex, { href: e.target.value || undefined })}
                  placeholder="Link bài giải thích chi tiết (không bắt buộc, vd: /series/slug/entry-slug)"
                  className={`${inputClass} mt-1.5 font-mono text-[12px]`}
                />
              </div>
            ))}
            <button
              type="button"
              onClick={() => addTerm(sectionIndex)}
              className="flex cursor-pointer items-center gap-1.5 self-start text-[12.5px] font-medium text-ink-faint hover:text-ink"
            >
              <Plus size={13} strokeWidth={2} />
              Thêm thuật ngữ
            </button>
          </div>
        </div>
      ))}
      <button
        type="button"
        onClick={addSection}
        className="flex cursor-pointer items-center gap-1.5 self-start rounded-md px-2 py-1.5 text-[13px] font-medium text-primary hover:bg-primary-soft"
      >
        <Plus size={14} strokeWidth={2} />
        Thêm section
      </button>
    </div>
  );
}
