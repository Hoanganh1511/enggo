"use client";

import { useState, useTransition } from "react";
import { SimpleModal } from "./simple-modal";
import { cn } from "@/lib/utils";

// Modal xac nhan dung chung (danh cho hanh dong can "bam lai lan nua cho
// chac" - go/them bai khoi 1 nhom, xoa...) - dung SimpleModal lam khung, chi
// them 2 nut Huy/Xac nhan. `onConfirm` co the throw - modal tu hien loi
// inline va KHONG tu dong (de nguoi dung thu lai), chi dong khi thanh cong.
export function ConfirmModal({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel = "Xác nhận",
  danger = false,
  onConfirm,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  confirmLabel?: string;
  danger?: boolean;
  onConfirm: () => Promise<void>;
}) {
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleConfirm() {
    setError(null);
    startTransition(async () => {
      try {
        await onConfirm();
        onOpenChange(false);
      } catch {
        setError("Có lỗi xảy ra, thử lại sau.");
      }
    });
  }

  return (
    <SimpleModal
      open={open}
      onOpenChange={(next) => {
        onOpenChange(next);
        if (!next) setError(null);
      }}
      title={title}
      description={description}
    >
      <div className="flex flex-col gap-3">
        {error && <p className="text-xs font-medium text-danger">{error}</p>}
        <div className="flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            disabled={isPending}
            className="h-9 cursor-pointer rounded-md border border-border px-4 text-xs font-semibold text-ink-muted transition-colors duration-150 ease-out hover:bg-hover-bg disabled:cursor-not-allowed disabled:opacity-60"
          >
            Huỷ
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={isPending}
            className={cn(
              "h-9 cursor-pointer rounded-md px-4 text-xs font-semibold text-white transition-colors duration-150 ease-out disabled:cursor-not-allowed disabled:opacity-60",
              danger
                ? "bg-danger hover:bg-danger/90"
                : "bg-community-accent hover:bg-community-accent-hover",
            )}
          >
            {isPending ? "Đang xử lý..." : confirmLabel}
          </button>
        </div>
      </div>
    </SimpleModal>
  );
}
