"use client";

import { SimpleModal } from "@/components/ui/simple-modal";

// Modal xac nhan roi trang khi con thay doi CHUA LUU - dung CHUNG voi
// useUnsavedChangesGuard (src/lib/use-unsaved-changes-guard.ts). Tach rieng
// component nay (thay vi nhung logic modal vao thang trong hook) de moi noi
// dung hook co the tu quyet dinh CACH hien thi/kieu chu neu can, nhung mac
// dinh dung y het component nay cho DONG NHAT giua cac trang.
export function UnsavedChangesModal({
  open,
  onConfirm,
  onCancel,
}: {
  open: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <SimpleModal
      open={open}
      onOpenChange={(next) => !next && onCancel()}
      title="Rời khỏi trang?"
      description="Bạn có thay đổi chưa lưu. Nếu rời khỏi bây giờ, các thay đổi này sẽ bị mất."
    >
      <div className="flex justify-end gap-2">
        <button
          type="button"
          onClick={onCancel}
          className="cursor-pointer rounded-lg border border-border px-4 py-2 text-[13px] font-medium text-ink-muted hover:bg-hover-bg"
        >
          Ở lại
        </button>
        <button
          type="button"
          onClick={onConfirm}
          className="cursor-pointer rounded-lg bg-danger px-4 py-2 text-[13px] font-semibold text-white hover:opacity-90"
        >
          Rời khỏi trang
        </button>
      </div>
    </SimpleModal>
  );
}
