"use client";

import { useState } from "react";
import { Mail } from "lucide-react";

// CTA dang ky nhan email khi Series co bai moi - dac ta muc 2.1 danh day la
// TUY CHON va khong dinh nghia backend cu the (khong nam trong pham vi
// ContentSeries API da lam) nen o day CHI la form UI xac nhan cuc bo, CHUA
// gui/luu that di dau - de tranh dung 1 bang subscriber rieng cho 1 tinh
// nang phu, chua co yeu cau ro rang se dung du lieu do lam gi.
export function SeriesEmailSignup({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;
    setSubmitted(true);
  }

  return (
    <div className="rounded-xl border border-border bg-surface-muted p-5">
      <div className="flex items-center gap-2">
        <Mail size={16} className="text-primary" aria-hidden="true" />
        <h3 className="text-[15px] font-semibold text-ink">{title}</h3>
      </div>
      <p className="mt-1.5 text-[13px] text-ink-faint">{description}</p>
      {submitted ? (
        <p className="mt-3 text-[13px] font-medium text-primary">
          Đã ghi nhận! Cảm ơn bạn đã quan tâm.
        </p>
      ) : (
        <form onSubmit={handleSubmit} className="mt-3 flex flex-col gap-2 sm:flex-row">
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email của bạn"
            className="min-w-0 flex-1 rounded-lg border border-border bg-surface px-3 py-2 text-[13px] outline-none focus:border-primary"
          />
          <button
            type="submit"
            className="cursor-pointer rounded-lg bg-ink px-4 py-2 text-[13px] font-semibold text-surface transition hover:opacity-90"
          >
            Đăng ký
          </button>
        </form>
      )}
    </div>
  );
}
