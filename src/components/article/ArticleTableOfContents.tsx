"use client";

import { useEffect, useState } from "react";
import { ChevronDown, List } from "lucide-react";
import {
  parseContentLines,
  type ContentLine,
} from "@/lib/discover/article-content";
import type { TiptapHeading } from "@/lib/discover/render-tiptap-html";
import { cn } from "@/lib/utils";

// Loc rieng phan heading tu CUNG 1 nguon parseContentLines ma ArticleBody.tsx
// dung de render toan bo noi dung (nhanh KHONG co richContent - bai cu/kind
// van ban tho) - dam bao id o day LUON khop voi id that trong DOM (khong the
// lech nhau vi chi co 1 ham sinh id duy nhat).
export function getHeadings(
  content: string,
): Extract<ContentLine, { type: "heading" }>[] {
  return parseContentLines(content).filter(
    (l): l is Extract<ContentLine, { type: "heading" }> => l.type === "heading",
  );
}

// "use client" - can scroll-spy (IntersectionObserver highlight muc dang
// doc) + toggle thu gon/mo rong, ca 2 deu la state/hieu ung phia trinh
// duyet. Render 2 LAN o page.tsx (dual-render qua breakpoint CSS, cung tinh
// than ArticlesHero/TopicsRail): 1 ban sidebar dinh ben phai tren desktop
// (variant="sidebar", mac dinh MO), 1 ban inline ngay duoi header tren
// mobile (variant="inline", mac dinh THU GON de khong chiem dat man hinh
// hep - theo mockup nguoi dung gui). 2 ban dung CHUNG data (headings truyen
// vao tu ngoai), chi khac style khung + trang thai mo/dong mac dinh.
export function ArticleTableOfContents({
  content,
  richHeadings,
  variant = "inline",
}: {
  content: string;
  richHeadings?: TiptapHeading[];
  variant?: "inline" | "sidebar";
}) {
  const headings = richHeadings ?? getHeadings(content);
  const [collapsed, setCollapsed] = useState(variant === "inline");
  const [activeId, setActiveId] = useState<string | null>(null);

  useEffect(() => {
    if (headings.length === 0) return;
    const observer = new IntersectionObserver(
      (entries) => {
        const firstVisible = entries.find((e) => e.isIntersecting);
        if (firstVisible) setActiveId(firstVisible.target.id);
      },
      { rootMargin: "-96px 0px -70% 0px", threshold: 0 },
    );
    const els = headings
      .map((h) => document.getElementById(h.id))
      .filter((el): el is HTMLElement => el !== null);
    els.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [headings.length]);

  if (headings.length === 0) return null;

  return (
    <nav
      className={cn(
        "rounded-lg border border-border bg-surface",
        variant === "sidebar" ? "p-4" : "p-3",
      )}
    >
      <button
        type="button"
        onClick={() => setCollapsed((v) => !v)}
        className="flex w-full cursor-pointer items-center justify-between gap-2"
      >
        <span className="flex items-center gap-1.5 text-sm font-bold text-ink">
          <List size={14} strokeWidth={2} />
          Mục lục
        </span>
        <ChevronDown
          size={14}
          strokeWidth={2}
          className={cn(
            "shrink-0 text-ink-faint transition-transform duration-150",
            !collapsed && "rotate-180",
          )}
        />
      </button>
      {!collapsed && (
        <ul className="mt-3 flex flex-col gap-1">
          {headings.map((h, i) => {
            const active = h.id === activeId;
            return (
              <li key={h.id}>
                <a
                  href={`#${h.id}`}
                  className={cn(
                    "flex items-center gap-2 rounded-md px-2 py-1.5 text-sm transition-colors duration-150 ease-out",
                    h.level >= 3 && "pl-6",
                    active
                      ? "bg-danger/10 font-semibold text-danger"
                      : "text-ink-muted hover:bg-hover-bg hover:text-ink",
                  )}
                >
                  <span
                    className={cn(
                      "flex size-5 shrink-0 items-center justify-center rounded-full text-[11px] font-bold",
                      active ? "bg-danger text-white" : "bg-surface-muted text-ink-faint",
                    )}
                  >
                    {i + 1}
                  </span>
                  <span className="line-clamp-1">{h.text}</span>
                </a>
              </li>
            );
          })}
        </ul>
      )}
    </nav>
  );
}
