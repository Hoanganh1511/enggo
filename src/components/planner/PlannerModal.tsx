"use client";

// [2026-10-09] Khung modal cho Planner. KHONG dung ui/simple-modal.tsx vi
// SimpleModal khong cho lay ra NODE cua Dialog.Content - ma Planner BAT BUOC
// can node do:
//
// Radix Dialog.Content khoa focus (FocusScope) vao CAY CON cua chinh no. 1
// Popover/DropdownMenu long ben trong mac dinh portal thang ra document.body,
// tuc nam NGOAI cay con ay - FocusScope lap tuc giat focus ve, control long
// trong modal thanh BAM KHONG DUOC. Cach chua: truyen `container` = chinh
// node Dialog.Content cho Portal cua control long, de no nam TRONG pham vi
// focus. Da gap that voi time picker trong Settings (nguoi dung bao "Không
// tương tác được trong chỗ chọn thời gian ở setting").
//
// Nen `children` o day la 1 HAM nhan node do - khong phai ReactNode thuong.

import * as Dialog from "@radix-ui/react-dialog";
import { useState } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

export function PlannerModal({
  open,
  onOpenChange,
  title,
  description,
  maxWidthClassName = "max-w-[520px]",
  children,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  maxWidthClassName?: string;
  /** Nhan node cua Dialog.Content - truyen xuong lam `container` cho moi
   *  Popover/DropdownMenu long ben trong. */
  children: (container: HTMLElement | null) => React.ReactNode;
}) {
  const [contentEl, setContentEl] = useState<HTMLDivElement | null>(null);

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/25 backdrop-blur-[2px]" />
        <Dialog.Content
          ref={setContentEl}
          onOpenAutoFocus={(e) => e.preventDefault()}
          className={cn(
            "fixed top-1/2 left-1/2 z-50 flex max-h-[88vh] w-[calc(100%-3rem)] -translate-x-1/2 -translate-y-1/2 flex-col rounded-[14px] border border-[color:var(--planner-border-soft)] bg-[color:var(--planner-surface)] shadow-[0_24px_64px_rgba(20,30,50,.22)] focus:outline-none",
            maxWidthClassName,
          )}
          // Portal ra ngoai .planner-scope nen KHONG inherit duoc font/token -
          // phai dat lai font-family tai day (cung ly do voi --planner-* o
          // :root, xem globals.css).
          style={{ fontFamily: "var(--planner-font-family)" }}
        >
          <div className="flex shrink-0 items-start justify-between gap-2 px-4 pt-4 pb-3">
            <div className="min-w-0">
              <Dialog.Title className="text-[14px] font-bold text-[color:var(--planner-text-primary)]">
                {title}
              </Dialog.Title>
              {description && (
                <Dialog.Description className="mt-0.5 text-[11.5px] leading-[1.45] text-[color:var(--planner-text-muted)]">
                  {description}
                </Dialog.Description>
              )}
            </div>
            <Dialog.Close
              className="flex size-7 shrink-0 cursor-pointer items-center justify-center rounded-[7px] text-[color:var(--planner-text-muted)] hover:bg-[color:var(--planner-surface-soft)] hover:text-[color:var(--planner-text-secondary)]"
              aria-label="Đóng"
            >
              <X size={15} />
            </Dialog.Close>
          </div>
          <div className="min-h-0 flex-1 overflow-y-auto px-4 pb-4">
            {children(contentEl)}
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
