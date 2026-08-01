"use client";

import { useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";

// Modal gui don xin tham gia 1 series cua nguoi khac. Nguoi tao series se
// doc dung 2 phan nay de quyet dinh nhan hay khong, nen ca 2 deu BAT BUOC -
// khong cho gui don rong (nut Gui bi disable toi khi du ca 2).
//
// Chua co backend (xem series-mock.ts): onSubmitted chi doi state client cua
// the/trang goi no sang "dang cho duyet", khong POST di dau ca.
export function JoinRequestModal({
  open,
  onOpenChange,
  seriesTitle,
  authorName,
  onSubmitted,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  seriesTitle: string;
  authorName: string;
  onSubmitted: () => void;
}) {
  const [reason, setReason] = useState("");
  const [intro, setIntro] = useState("");

  const canSubmit = reason.trim().length > 0 && intro.trim().length > 0;

  const handleSubmit = () => {
    if (!canSubmit) return;
    onSubmitted();
    setReason("");
    setIntro("");
    onOpenChange(false);
  };

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-overlay" />
        <Dialog.Content
          onOpenAutoFocus={(e) => e.preventDefault()}
          className="fixed top-1/2 left-1/2 z-50 flex max-h-[85vh] w-[calc(100%-3rem)] max-w-md -translate-x-1/2 -translate-y-1/2 flex-col rounded-sm border border-border bg-surface p-6 shadow-panel focus:outline-none"
        >
          <Dialog.Title className="text-base font-semibold text-ink">
            Xin tham gia series
          </Dialog.Title>
          <Dialog.Description className="mt-1 text-xs leading-relaxed text-ink-muted">
            <span className="font-medium text-ink">{seriesTitle}</span> ·{" "}
            {authorName} sẽ đọc phần trình bày của bạn trước khi duyệt.
          </Dialog.Description>

          <div className="mt-4 flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto">
            <div>
              <label
                htmlFor="join-reason"
                className="mb-1 block text-xs font-medium text-ink-muted"
              >
                Vì sao bạn muốn tham gia?
              </label>
              <textarea
                id="join-reason"
                autoFocus
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                rows={4}
                placeholder="Mục tiêu bạn muốn đạt được, mức thời gian bạn có thể dành mỗi ngày…"
                className="w-full resize-none rounded-sm border border-border bg-surface px-3 py-2 text-sm text-ink placeholder:text-ink-faint focus:border-focus-border focus:outline-none"
              />
            </div>

            <div>
              <label
                htmlFor="join-intro"
                className="mb-1 block text-xs font-medium text-ink-muted"
              >
                Giới thiệu bản thân
              </label>
              <textarea
                id="join-intro"
                value={intro}
                onChange={(e) => setIntro(e.target.value)}
                rows={3}
                placeholder="Công việc hiện tại, kinh nghiệm liên quan, những gì bạn đã tự học…"
                className="w-full resize-none rounded-sm border border-border bg-surface px-3 py-2 text-sm text-ink placeholder:text-ink-faint focus:border-focus-border focus:outline-none"
              />
            </div>
          </div>

          <div className="mt-5 flex shrink-0 justify-end gap-2">
            <Dialog.Close asChild>
              <button
                type="button"
                className="cursor-pointer rounded-sm px-3 py-1.5 text-xs text-ink-muted transition-colors duration-150 ease-out hover:bg-hover-bg"
              >
                Huỷ
              </button>
            </Dialog.Close>
            <button
              type="button"
              disabled={!canSubmit}
              onClick={handleSubmit}
              className="cursor-pointer rounded-sm bg-primary px-3 py-1.5 text-sm font-medium text-white transition-colors duration-150 ease-out hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-50"
            >
              Gửi đơn
            </button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
