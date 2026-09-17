"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Search, ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";
import type { DictionarySection, DictionaryTerm } from "@/lib/api/content-series";

// [2026-09-17] "Guides > Dictionary" - yeu cau nguoi dung: "bổ sung thêm 1
// cate Guides ngay tiếp theo dưới Explore, trong này sẽ có 1 page mặc định
// là: Dictionary. Tạm thời cứ thiết kế trước layout như trong ảnh cho nó."
// roi sau do "Làm đi" (chuyen tu du lieu tinh HARDCODE trong component nay
// sang DB-backed - `sections` gio la 1 PROP that su, doc tu
// entry.dictionarySections, sua duoc qua DictionarySectionsEditor.tsx trong
// form soan Entry - xem SeriesEntryForm.tsx). So luong canh moi section gio
// la items.length THAT (khong con "gia tri muc tieu" tinh nhu ban thiet ke
// layout truoc).
export function SeriesDictionaryView({ sections }: { sections: DictionarySection[] }) {
  const [query, setQuery] = useState("");
  const [activeSectionId, setActiveSectionId] = useState(sections[0]?.id ?? "");

  const activeSection = sections.find((s) => s.id === activeSectionId) ?? sections[0];

  const filteredTerms = useMemo(() => {
    if (!activeSection) return [];
    const q = query.trim().toLowerCase();
    if (!q) return activeSection.terms;
    return activeSection.terms.filter(
      (t) => t.term.toLowerCase().includes(q) || t.description.toLowerCase().includes(q),
    );
  }, [activeSection, query]);

  if (!activeSection) {
    return (
      <div className="font-content flex min-h-[calc(100vh-var(--header-height))] items-center justify-center">
        <p className="text-[13px] text-ink-faint">Chưa có nội dung nào trong Dictionary.</p>
      </div>
    );
  }

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
            {sections.map((section) => (
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
                  {section.terms.length}
                </span>
              </button>
            ))}
          </nav>
        </div>
      </aside>

      {/* Luoi thuat ngu 2 cot - moi the: tieu de + mui ten (LINK THAT neu co
          href, xem DictionaryTermCard) + mo ta. */}
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
              <DictionaryTermCard key={item.term} item={item} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// Co `href` -> mui ten tro thanh LINK THAT (thuong toi 1 Series Entry day du
// giai thich rieng cho khai niem do - yeu cau nguoi dung: "ví dụ tôi có
// những từ cần bài viết giải thích chi tiết thì có thể viết những bài cho
// concept đấy ở Dictionary được?") + hover doi mau bao hieu bam duoc. Khong
// co `href` -> giu nguyen the tinh (mui ten chi trang tri).
function DictionaryTermCard({ item }: { item: DictionaryTerm }) {
  const body = (
    <>
      <div className="flex items-start justify-between gap-2">
        <p
          className={cn(
            "text-[15px] font-bold text-ink",
            item.href && "group-hover:text-primary",
          )}
        >
          {item.term}
        </p>
        <ArrowUpRight
          size={15}
          strokeWidth={2}
          className={cn(
            "mt-0.5 shrink-0 text-ink-faint",
            item.href && "transition-colors duration-150 ease-out group-hover:text-primary",
          )}
          aria-hidden="true"
        />
      </div>
      <p className="mt-1 text-[13.5px] text-ink-muted">{item.description}</p>
    </>
  );

  if (!item.href) return <div>{body}</div>;

  const isExternal = /^https?:\/\//.test(item.href);
  if (isExternal) {
    return (
      <a href={item.href} target="_blank" rel="noreferrer" className="group block cursor-pointer">
        {body}
      </a>
    );
  }
  return (
    <Link href={item.href} className="group block cursor-pointer">
      {body}
    </Link>
  );
}
