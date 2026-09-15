"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Download } from "lucide-react";
import { toast } from "@/lib/toast/toast-store";
import { useFocusModeStore } from "@/stores/focus-mode-store";

// Id cua khoi noi dung THAT (DocsMarkdown render trong EntryBody, xem
// page.tsx) - PDF can chup DOM node nay (html2canvas), Markdown thi da co san
// contentMarkdown truyen thang qua props nen khong can DOM.
export const ENTRY_CONTENT_ID = "series-entry-content";

function slugifyFileName(title: string): string {
  return (
    title
      .normalize("NFD")
      .replace(/[̀-ͯ]/g, "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "") || "bai-viet"
  );
}

function downloadBlob(blob: Blob, fileName: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

// Nam ngay duoi tieu de Entry (yeu cau nguoi dung) - 2 nut Tai PDF/Markdown
// (chung 1 icon Download, khac chu) + switch "Focus mode". Markdown tai
// TRUC TIEP tu contentMarkdown (da co san, khong can DOM). PDF phai doi noi
// dung THAT render xong (EntryBody la Suspense branch KHAC, co the chua
// mount neu bam qua nhanh) - bao loi ro rang thay vi crash im lang neu chua
// tim thay #series-entry-content.
export function EntryDownloadButtons({
  title,
  contentMarkdown,
}: {
  title: string;
  contentMarkdown: string;
}) {
  const [generatingPdf, setGeneratingPdf] = useState(false);
  const focusModeActive = useFocusModeStore((s) => s.active);
  const focusModeTransitioning = useFocusModeStore((s) => s.transitioning);
  const toggleFocusMode = useFocusModeStore((s) => s.toggle);

  function handleDownloadMarkdown() {
    const blob = new Blob([contentMarkdown], { type: "text/markdown;charset=utf-8" });
    downloadBlob(blob, `${slugifyFileName(title)}.md`);
  }

  async function handleDownloadPdf() {
    const node = document.getElementById(ENTRY_CONTENT_ID);
    if (!node) {
      toast.danger("Nội dung bài viết chưa tải xong, đợi 1 chút rồi thử lại.");
      return;
    }
    setGeneratingPdf(true);
    try {
      const [{ default: html2canvas }, { jsPDF }] = await Promise.all([
        import("html2canvas"),
        import("jspdf"),
      ]);
      const canvas = await html2canvas(node, { scale: 2, useCORS: true });
      const imgData = canvas.toDataURL("image/png");

      // A4 doc (mm), can toa canvas ve theo chieu rong trang - cao hon 1
      // trang thi cat thanh nhieu trang (addPage) thay vi nen mop 1 trang.
      const pdf = new jsPDF({ unit: "mm", format: "a4" });
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const imgWidth = pageWidth;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      let heightLeft = imgHeight;
      let position = 0;
      pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
      while (heightLeft > 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      pdf.save(`${slugifyFileName(title)}.pdf`);
    } catch {
      toast.danger("Tạo PDF thất bại, thử lại sau.");
    } finally {
      setGeneratingPdf(false);
    }
  }

  return (
    <div className="font-content mt-4 flex flex-wrap items-center gap-3">
      <button
        type="button"
        onClick={handleDownloadPdf}
        disabled={generatingPdf}
        className="flex h-8 cursor-pointer items-center gap-1.5 rounded-md border border-border px-3 text-[12.5px] font-medium text-ink-muted transition-colors duration-150 ease-out hover:bg-hover-bg hover:text-ink disabled:cursor-wait disabled:opacity-60"
      >
        <Download size={13} strokeWidth={2} aria-hidden="true" />
        {generatingPdf ? "Đang tạo PDF..." : "Tải PDF"}
      </button>
      <button
        type="button"
        onClick={handleDownloadMarkdown}
        className="flex h-8 cursor-pointer items-center gap-1.5 rounded-md border border-border px-3 text-[12.5px] font-medium text-ink-muted transition-colors duration-150 ease-out hover:bg-hover-bg hover:text-ink"
      >
        <Download size={13} strokeWidth={2} aria-hidden="true" />
        Tải Markdown
      </button>

      {/* Switch rieng (khong dung lai Toggle chung o SettingsControls.tsx -
          ban do to hon va mau xanh --primary, lac tong voi khu Series dang
          dung 1 accent duy nhat rgb(245,196,81) cho moi trang thai active/
          nut chinh - doi tu #8F3F4D theo yeu cau nguoi dung, xem
          RecentPostsMenu.tsx/TopHeaderBar.tsx "Viết bài"). Kich thuoc nho
          gon hon (h-5 w-9) khop voi 2 nut Tai PDF/Markdown ben canh.
          [2026-09-15, sua lai] Ban DAU dung motion.span + `layout` (FLIP do
          bounding-box) de tu tinh vi tri knob - VO TINH XUNG DOT voi
          SeriesFocusRow.tsx CUNG bat mot `layout` animation NGAY LUC bam nut
          nay (row chuyen tu vi tri thuong sang `position: fixed` can giua -
          xem comment o do): Framer Motion do lai bounding box cho MOI layout
          animation dang chay cung luc de tu bu tru scale/dich chuyen tu to
          tien, nhung 1 to tien VUA doi `position` sang `fixed` giua chung
          lam gia tri do lech (getBoundingClientRect cua phan tu fixed tinh
          theo viewport, khac hoan toan luc con nam trong luong trang) - khien
          knob nhay sai vi tri (nguoi dung bao loi: "cái toggle switch bị lệch
          đi do bạn đang xử lý focus cái page seri scale từng cánh 1"). Doi
          han sang `animate={{ x }}` (transform SO TUYET DOI, KHONG do dac
          bounding-box cua bat ky ai) - hoan toan doc lap voi moi layout/
          position animation khac dang chay dong thoi tren trang, du to tien
          co doi the nao. left CO DINH 2px (Tailwind left-0.5), x truot them
          16px (= be rong track 36px - be rong knob 16px - 2*padding 2px) khi
          bat. whileTap tren CA nut (khong chi tren knob) de nen xuong hoi
          "bop" lai luc bam, nha ra luc tha - phan hoi xuc giac ro rang hon 1
          nut tinh khong phan hoi gi luc bam. */}
      <label className="ml-1 flex cursor-pointer items-center gap-1.5 text-[12.5px] font-medium text-ink-muted select-none">
        <motion.button
          type="button"
          role="switch"
          aria-checked={focusModeActive}
          aria-label="Focus mode"
          onClick={toggleFocusMode}
          disabled={focusModeTransitioning}
          whileTap={{ scale: 0.9 }}
          className={`relative h-5 w-9 shrink-0 rounded-full transition-colors duration-200 ease-out ${
            focusModeTransitioning ? "cursor-wait" : "cursor-pointer"
          } ${focusModeActive ? "bg-accent-gold" : "bg-ink-disabled"}`}
        >
          <motion.span
            animate={{ x: focusModeActive ? 16 : 0 }}
            transition={{ type: "spring", stiffness: 700, damping: 30 }}
            className="absolute top-0.5 left-0.5 size-4 rounded-full bg-white"
          />
        </motion.button>
        Focus mode
      </label>
    </div>
  );
}
