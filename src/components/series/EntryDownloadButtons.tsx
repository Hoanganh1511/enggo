"use client";

import { useState } from "react";
import { Download } from "lucide-react";
import { toast } from "@/lib/toast/toast-store";
import { Toggle } from "@/components/settings/SettingsControls";
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

      <label className="ml-1 flex cursor-pointer items-center gap-2 text-[12.5px] font-medium text-ink-muted">
        <Toggle checked={focusModeActive} onChange={toggleFocusMode} label="Focus mode" />
        Focus mode
      </label>
    </div>
  );
}
