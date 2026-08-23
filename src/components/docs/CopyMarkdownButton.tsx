"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";

// Copy markdown THO cua bai dang xem (khong phai HTML da render) - giong quy
// uoc pho bien o cac trang docs (ReUI, Shadcn...) trong anh mau nguoi dung
// dua, dung cho ai muon dan thang vao 1 LLM khac hoi tiep.
export function CopyMarkdownButton({ markdown }: { markdown: string }) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(markdown);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // Trinh duyet chan Clipboard API (vd khong phai HTTPS/context khong an
      // toan) - bo qua, khong co gi vo hai hon de lam thay.
    }
  }

  return (
    <button
      type="button"
      onClick={handleCopy}
      className="flex shrink-0 cursor-pointer items-center gap-1.5 rounded-lg border border-border bg-surface px-3 py-1.5 text-xs font-medium text-ink transition-colors duration-150 ease-out hover:bg-hover-bg"
    >
      {copied ? <Check size={13} className="text-emerald-500" /> : <Copy size={13} />}
      {copied ? "Đã copy" : "Copy Markdown"}
    </button>
  );
}
