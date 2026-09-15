"use client";

import { useEffect, useState } from "react";
import { startTransition } from "react";
import { motion } from "framer-motion";
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
    let cancelled = false;
    let observer: IntersectionObserver | null = null;
    let retryTimer: ReturnType<typeof setTimeout> | null = null;

    // DocsToc (nhanh Suspense "EntryToc") va than bai THAT chua heading
    // (nhanh Suspense "EntryBody") la 2 Suspense DOC LAP, KHONG dam bao
    // than bai da mount xong luc effect nay chay lan dau - neu bat luc do,
    // "document.getElementById()" tra ve null het (heading chua ton tai
    // trong DOM), effect cu the BO CUOC han (khong active nao duoc gan,
    // khong observer nao duoc tao) vi dependency `[toc]` khong doi lai sau
    // do de chay lai - day chinh la ly do "Active color... đâu?" (khong
    // item nao sang mau/co thanh vang ca, du dang o dau trang) nguoi dung
    // bao. Sua bang cach THU LAI (retry) toi da 20 lan (150ms/lan, ~3s) cho
    // toi khi tim thay heading, thay vi bo cuoc ngay lan dau.
    let attempts = 0;
    function trySetup() {
      if (cancelled) return;
      const els = toc
        .map((t) => document.getElementById(t.id))
        .filter((el): el is HTMLElement => el !== null);
      if (els.length === 0) {
        attempts += 1;
        if (attempts < 20) retryTimer = setTimeout(trySetup, 150);
        return;
      }

      startTransition(() => setActiveId(els[0].id));

      const visible = new Set<string>();
      observer = new IntersectionObserver(
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
      els.forEach((el) => observer!.observe(el));
    }

    trySetup();
    return () => {
      cancelled = true;
      if (retryTimer) clearTimeout(retryTimer);
      observer?.disconnect();
    };
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
            "relative py-1 text-[13px] transition-colors duration-150 ease-out",
            item.level === 3 && "pl-3",
            item.id === activeId
              ? "font-medium text-ink"
              : "text-[color-mix(in_srgb,var(--ink-faint)_85%,black)] hover:text-ink-muted",
          )}
        >
          {/* Thanh vang chinh (--accent-gold) danh dau muc DANG ACTIVE (dua
              theo scroll-spy activeId da co san o tren) - de LEN TREN dung
              vi tri border-l cua ca nav (pl-3/-left-3 = 12px khop nhau), yeu
              cau nguoi dung: "1 thanh màu vàng chủ đạo... hiệu ứng active
              khi màn ở vị trí tương ứng trong nội dung", khop anh mau.
              [2026-09-15] Chu active doi sang text-ink (den) thay vi mau
              vang - yeu cau nguoi dung: "Cho active chữ đen" (thanh vang ben
              trai VAN GIU, chi rieng MAU CHU active doi). w-px (khong con
              w-0.5=2px) - do day thanh PHAI BANG dung border-l cua nav (mac
              dinh Tailwind border = 1px): "Độ dầy thanh màu cũng cho bằng
              đường line của nó".
              [2026-09-15] motion.span + layoutId CO DINH ("toc-active-bar") -
              truoc do la <span> thuong, moi lan activeId doi thi span CU
              (gan voi <a> cu) bien mat, span MOI (gan voi <a> moi) xuat hien
              tuc thi o vi tri khac - nhin roi rac, "không được đúng là trượt
              trên rãnh" (yeu cau nguoi dung, so voi anh mau: thanh vang THAT
              SU truot lien tuc doc theo duong border-l, nhu 1 con truot nam
              trong 1 cai ranh, khong phai bien mat/hien lai o 2 noi khac
              nhau). Cung 1 layoutId qua nhieu lan render (chi 1 <a> render no
              tai 1 thoi diem) khien framer-motion tu dong noi 2 vi tri
              CU/MOI bang 1 chuyen dong FLIP muot, dung cam giac "slide".
              [2026-09-15 fix] -left-3 (-12px) THIEU MAT do RONG cua chinh
              border-l tren <nav> (1px): <a> nam sau border(1px)+pl-3(12px)
              cua nav, tuc canh trai cua <a> da CACH duong border 13px, khong
              phai 12px - offset -left-3 chi keo lai dung 12px nen thanh vang
              luon lech 1px SANG PHAI so voi duong border-l (nguoi dung bao
              "chưa trùng vào rãnh, trông rất lệch"). Doi sang calc(-0.75rem -
              1px) de tru them dung 1px border do. */}
          {item.id === activeId && (
            <motion.span
              layoutId="toc-active-bar"
              aria-hidden="true"
              className="absolute top-0 h-full w-px"
              style={{ left: "calc(-0.75rem - 1px)", backgroundColor: "var(--accent-gold)" }}
              transition={{ type: "spring", stiffness: 500, damping: 40 }}
            />
          )}
          {item.text}
        </a>
      ))}
    </nav>
  );
}
