"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Search, ArrowUpRight, FileCode2 } from "lucide-react";
import { cn } from "@/lib/utils";
import type { DictionarySection, DictionaryTerm } from "@/lib/api/content-series";

function toHashSlug(title: string): string {
  return `#${title.trim().toLowerCase().replace(/\s+/g, "-")}`;
}

// [2026-09-17] "Guides > Dictionary" - yeu cau nguoi dung: "bổ sung thêm 1
// cate Guides ngay tiếp theo dưới Explore, trong này sẽ có 1 page mặc định
// là: Dictionary. Tạm thời cứ thiết kế trước layout như trong ảnh cho nó."
// roi sau do "Làm đi" (chuyen tu du lieu tinh HARDCODE trong component nay
// sang DB-backed - `sections` gio la 1 PROP that su, doc tu
// entry.dictionarySections, sua duoc qua DictionarySectionsEditor.tsx trong
// form soan Entry - xem SeriesEntryForm.tsx). So luong canh moi section gio
// la items.length THAT (khong con "gia tri muc tieu" tinh nhu ban thiet ke
// layout truoc).
//
// [2026-10-03] Them "hero" dau trang (eyebrow + tieu de + mo ta + badge
// nguon + panel trang tri goc phai) - yeu cau nguoi dung kem anh mau tham
// khao (trang "Dictionary of AI Coding"): "tạo luôn UI/UX cho trang như này
// với thiết kế đã đính kèm trong ảnh" - ban truoc CHI co phan search+sidebar+
// luoi, thieu han phan dau nay. KHONG bia them field moi (vd "số sao",
// "repo") - dung LAI dung field entry da co san (title/subtitle/source, VON
// DA la field chuan cua moi Entry, khong rieng gi Dictionary) de tranh fake
// du lieu khong that (vd so "sao" GitHub trong anh mau la cua 1 repo ngoai,
// khong co tuong duong that trong he thong nay).
export function SeriesDictionaryView({
  seriesTitle,
  title,
  subtitle,
  source,
  sections,
}: {
  seriesTitle: string;
  title: string;
  subtitle?: string | null;
  source?: string | null;
  sections: DictionarySection[];
}) {
  const [query, setQuery] = useState("");
  const [activeSectionId, setActiveSectionId] = useState(sections[0]?.id ?? "");

  const activeSection = sections.find((s) => s.id === activeSectionId) ?? sections[0];
  const totalTerms = sections.reduce((sum, s) => sum + s.terms.length, 0);

  const filteredTerms = useMemo(() => {
    if (!activeSection) return [];
    const q = query.trim().toLowerCase();
    if (!q) return activeSection.terms;
    return activeSection.terms.filter(
      (t) => t.term.toLowerCase().includes(q) || t.description.toLowerCase().includes(q),
    );
  }, [activeSection, query]);

  return (
    <div className="font-content -mx-6 -my-6 lg:-mx-10">
      {/* Hero - 2 cot: trai la eyebrow/tieu de/mo ta/nguon, phai la 1 panel
          trang tri (van ke cheo, chi de "dan trang", KHONG mang thong tin
          gi) liet ke nhanh TEN cac section (dang "#section-title", tu
          `sections` that - tu dong theo kip khi them/bot/doi ten section,
          khong phai 1 danh sach go tay rieng). */}
      <div className="grid grid-cols-1 border-b border-border sm:grid-cols-2">
        <div className="flex flex-col justify-center gap-3 px-6 py-10 sm:px-10 sm:py-14">
          <p className="font-mono text-[11px] font-semibold tracking-widest text-ink-faint uppercase">
            {seriesTitle} · Dictionary
          </p>
          <h1 className="text-[32px] leading-tight font-extrabold text-ink sm:text-[40px]">{title}</h1>
          {subtitle && <p className="max-w-lg text-[15px] leading-relaxed text-ink-muted">{subtitle}</p>}
          <p className="text-[13.5px] text-ink-faint">
            Search {totalTerms} {totalTerms === 1 ? "entry" : "entries"} below, or jump into a section.
          </p>
          {source && (
            <div className="mt-1 flex items-center gap-1.5 text-[12.5px] text-ink-faint">
              <FileCode2 size={13} strokeWidth={2} aria-hidden="true" />
              <span className="font-mono">{source}</span>
            </div>
          )}
        </div>
        <div
          className="hidden min-h-48 flex-col justify-center gap-2.5 overflow-hidden bg-surface-muted/50 px-10 py-10 sm:flex"
          style={{
            backgroundImage:
              "repeating-linear-gradient(135deg, rgba(0,0,0,0.045) 0px, rgba(0,0,0,0.045) 1.5px, transparent 1.5px, transparent 11px)",
          }}
        >
          {sections.map((section) => (
            <span key={section.id} className="truncate font-mono text-[13px] text-ink-muted/80">
              {toHashSlug(section.title)}
            </span>
          ))}
        </div>
      </div>

      {activeSection ? (
        <div className="flex min-h-[calc(100vh-var(--header-height))]">
          {/* Sidebar trai - search + danh sach SECTIONS (co so luong) - khop
              mockup nguoi dung gui. sticky theo chieu cao view rieng cua
              trang nay (khong dung chung sticky cua DocsToc, day la 1 kieu
              dieu huong KHAC - chon 1 nhom de loc, khong phai nhay anchor). */}
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

          {/* Luoi thuat ngu 2 cot - moi the: tieu de + mui ten (LINK THAT neu
              co href, xem DictionaryTermCard) + mo ta. */}
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
      ) : (
        <div className="flex min-h-[40vh] items-center justify-center">
          <p className="text-[13px] text-ink-faint">Chưa có nội dung nào trong Dictionary.</p>
        </div>
      )}
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
