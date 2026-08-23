"use client";

import { useEffect, useState } from "react";
import { startTransition } from "react";
import { cn } from "@/lib/utils";
import type { DocsTocItem } from "@/lib/docs/docs-toc";

// "On This Page" - scroll-spy tren toan trang (root: null, khac
// ArticleReaderPane.tsx dung root la 1 container cuon rieng vi khung doc do
// nam trong overflow-y-auto cua no - trang docs nay cuon THEO window binh
// thuong). Rong (khong co heading con) la trang thai THAT, khong bia muc luc
// gia - phan lon bai engineering-log hien tai chua co heading H2/H3 BEN
// TRONG than bai (chi dung **label:** in dam), xem docs-toc.ts.
export function DocsToc({ toc }: { toc: DocsTocItem[] }) {
  const [activeId, setActiveId] = useState<string>("");

  useEffect(() => {
    if (toc.length === 0) return;
    const els = toc
      .map((t) => document.getElementById(t.id))
      .filter((el): el is HTMLElement => el !== null);
    if (els.length === 0) return;

    startTransition(() => setActiveId(els[0].id));

    const visible = new Set<string>();
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) visible.add(entry.target.id);
          else visible.delete(entry.target.id);
        }
        const current = els.find((el) => visible.has(el.id));
        if (current) setActiveId(current.id);
      },
      { rootMargin: "0px 0px -70% 0px", threshold: 0 },
    );
    els.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [toc]);

  if (toc.length === 0) {
    return (
      <p className="text-xs text-ink-faint">Bài viết này không có mục lục con.</p>
    );
  }

  return (
    <nav className="flex flex-col gap-0.5 border-l border-border pl-3">
      <p className="mb-2 text-[11px] font-semibold tracking-wide text-ink-faint uppercase">
        On This Page
      </p>
      {toc.map((item) => (
        <a
          key={item.id}
          href={`#${item.id}`}
          className={cn(
            "py-1 text-[13px] transition-colors duration-150 ease-out",
            item.level === 3 && "pl-3",
            item.id === activeId
              ? "font-medium text-ink"
              : "text-ink-faint hover:text-ink-muted",
          )}
        >
          {item.text}
        </a>
      ))}
    </nav>
  );
}
